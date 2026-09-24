const ProviderProfile = require('../../models/ProviderProfile');
const Booking = require('../../models/Booking');

// Weighted-scoring "AI ranking" of providers for a classified request.
// Deterministic and explainable on purpose -- a marketplace ranking feature
// should be auditable, so this is a scored heuristic rather than an opaque
// LLM call. Signals: skill overlap, service-area match, availability in the
// requested window, historical rating, and completed-job volume.
const WEIGHTS = {
  skills: 0.35,
  area: 0.2,
  availability: 0.15,
  rating: 0.2,
  experience: 0.1,
};

async function isProviderFreeDuringWindow(providerId, start, end) {
  if (!start || !end) return true; // no preferred window given -> don't penalize
  const conflict = await Booking.findOne({
    provider: providerId,
    status: { $in: ['scheduled', 'en_route', 'in_progress'] },
    'slot.startTime': { $lt: end },
    'slot.endTime': { $gt: start },
  }).lean();
  return !conflict;
}

function skillOverlapScore(providerSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return 0.5; // neutral if request has no explicit skills
  const providerSet = new Set(providerSkills.map((s) => s.toLowerCase()));
  const matched = requiredSkills.filter((s) => providerSet.has(s.toLowerCase()));
  return matched.length / requiredSkills.length;
}

function areaMatchScore(providerAreas = [], requestArea) {
  if (!requestArea) return 0.5;
  return providerAreas.some((a) => a.toLowerCase() === requestArea.toLowerCase()) ? 1 : 0;
}

// requestInfo: { categoryId, requiredSkills, area, windowStart, windowEnd }
async function rankProviders(requestInfo) {
  const { categoryId, requiredSkills = [], area, windowStart, windowEnd } = requestInfo;

  const query = { verificationStatus: 'approved' };
  if (categoryId) query.categories = categoryId;

  const candidates = await ProviderProfile.find(query).populate('user', 'name email isActive').lean();

  const scored = await Promise.all(
    candidates
      .filter((p) => p.user && p.user.isActive)
      .map(async (p) => {
        const skillsScore = skillOverlapScore(p.skills, requiredSkills);
        const areaScore = areaMatchScore(p.serviceAreas, area);
        const free = await isProviderFreeDuringWindow(p._id, windowStart, windowEnd);
        const availabilityScore = free ? 1 : 0;
        const ratingScore = (p.avgRating || 0) / 5;
        const experienceScore = Math.min((p.completedJobsCount || 0) / 20, 1);

        const matchScore =
          skillsScore * WEIGHTS.skills +
          areaScore * WEIGHTS.area +
          availabilityScore * WEIGHTS.availability +
          ratingScore * WEIGHTS.rating +
          experienceScore * WEIGHTS.experience;

        return {
          providerId: p._id,
          name: p.user.name,
          avgRating: p.avgRating,
          completedJobsCount: p.completedJobsCount,
          serviceAreas: p.serviceAreas,
          skills: p.skills,
          matchScore: Number(matchScore.toFixed(3)),
          matchBreakdown: {
            skillsScore: Number(skillsScore.toFixed(2)),
            areaScore: Number(areaScore.toFixed(2)),
            availabilityScore,
            ratingScore: Number(ratingScore.toFixed(2)),
            experienceScore: Number(experienceScore.toFixed(2)),
          },
        };
      })
  );

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { rankProviders };
