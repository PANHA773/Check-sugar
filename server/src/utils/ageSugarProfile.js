export function resolveAgeFromInput({ age, birthYear }) {
  const currentYear = new Date().getFullYear();

  const parsedAge = Number(age);
  if (!Number.isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120) {
    return Math.floor(parsedAge);
  }

  const parsedBirthYear = Number(birthYear);
  if (
    !Number.isNaN(parsedBirthYear) &&
    parsedBirthYear >= 1900 &&
    parsedBirthYear <= currentYear
  ) {
    const resolved = currentYear - Math.floor(parsedBirthYear);
    if (resolved >= 0 && resolved <= 120) {
      return resolved;
    }
  }

  return null;
}

export function getAgeSugarProfile(age) {
  const parsedAge = Number(age);

  if (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
    return {
      ageGroup: "adult",
      dailySugarLimitG: 25
    };
  }

  if (parsedAge <= 12) {
    return {
      ageGroup: "children",
      dailySugarLimitG: 15
    };
  }

  if (parsedAge <= 59) {
    return {
      ageGroup: "adult",
      dailySugarLimitG: 25
    };
  }

  return {
    ageGroup: "elderly",
    dailySugarLimitG: 20
  };
}

export function normalizeAgePayload(body, existing = null) {
  const hasAge = body.age !== undefined && body.age !== null && String(body.age).trim() !== "";
  const hasBirthYear = body.birthYear !== undefined && body.birthYear !== null && String(body.birthYear).trim() !== "";

  const sourceAge = hasAge ? body.age : existing?.age;
  const sourceBirthYear = hasBirthYear ? body.birthYear : existing?.birthYear;

  const age = resolveAgeFromInput({ age: sourceAge, birthYear: sourceBirthYear });

  if ((hasAge || hasBirthYear) && age === null) {
    return {
      error: "Provide valid age (0-120) or birth year"
    };
  }

  const profile = getAgeSugarProfile(age);

  const normalizedBirthYear = hasBirthYear
    ? Number.isNaN(Number(body.birthYear))
      ? null
      : Math.floor(Number(body.birthYear))
    : (existing?.birthYear ?? null);

  return {
    payload: {
      age,
      birthYear: normalizedBirthYear,
      ageGroup: profile.ageGroup,
      dailySugarLimitG: profile.dailySugarLimitG
    }
  };
}
