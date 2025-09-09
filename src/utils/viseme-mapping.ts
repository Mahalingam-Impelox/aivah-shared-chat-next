// UPDATED VISEME MAPPING - Direct viseme morph targets as shown in interface
// Each viseme maps directly to its corresponding morph target with value 1, others 0
export const wawaVisemeToMorphTarget = (viseme: string): Record<string, number> => {
  const baseViseme = viseme.replace('viseme_', '');

  // Direct viseme mapping - only the current viseme gets value 1, all others 0
  const allVisemes = ['sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR', 'aa', 'E', 'I', 'O', 'U'];
  const result: Record<string, number> = {};

  // Initialize all visemes to 0
  allVisemes.forEach(v => {
    result[`viseme_${v}`] = 0;
  });

  // Set current viseme to 1
  if (allVisemes.includes(baseViseme)) {
    result[`viseme_${baseViseme}`] = 1;
  } else {
    // Default to silence if viseme not found
    result['viseme_sil'] = 1;
  }

  // Also include mouthOpen for backward compatibility
  result['mouthOpen'] = baseViseme === 'sil' ? 0 : 0.5;

  return result;
};

// LEGACY MAPPING - Keep for backward compatibility with traditional morph targets
export const wawaVisemeToTraditionalMorphTarget = (viseme: string): Record<string, number> => {
  const baseViseme = viseme.replace('viseme_', '');

  // Traditional morph target mapping for models that don't use direct visemes
  const visemeMapping: Record<string, Record<string, number>> = {
    sil: {
      mouthOpen: 0.0,
      jawOpen: 0.0,
      mouthClose: 1.0,
      jawClose: 1.0,
      teethOpen: 0.0
    },
    aa: {
      mouthOpen: 0.0, // very open
      jawOpen: 1.0, // very open
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.0 // slightly open
    },
    I: {
      mouthOpen: 0.7, // open, but less than aa
      jawOpen: 0.6,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.5
    },
    E: {
      mouthOpen: 0.8, // wide, but not as open as aa
      jawOpen: 0.7,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.6
    },
    O: {
      mouthOpen: 0.9, // round, open
      jawOpen: 0.8,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.7
    },
    U: {
      mouthOpen: 0.7, // rounded, less open
      jawOpen: 0.6,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.5
    },
    DD: {
      mouthOpen: 0.1, // almost closed
      jawOpen: 0.1,
      mouthClose: 0.9,
      jawClose: 0.9,
      teethOpen: 0.1
    },
    PP: {
      mouthOpen: 0.0, // lips together
      jawOpen: 0.0,
      mouthClose: 1.0,
      jawClose: 1.0,
      teethOpen: 0.0
    },
    FF: {
      mouthOpen: 0.2, // teeth on lip
      jawOpen: 0.2,
      mouthClose: 0.7,
      jawClose: 0.7,
      teethOpen: 0.2
    },
    TH: {
      mouthOpen: 0.3, // tongue between teeth
      jawOpen: 0.2,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    },
    kk: {
      mouthOpen: 0.2, // back of mouth, slightly open
      jawOpen: 0.2,
      mouthClose: 0.8,
      jawClose: 0.8,
      teethOpen: 0.1
    },
    CH: {
      mouthOpen: 0.3, // similar to TH
      jawOpen: 0.2,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    },
    SS: {
      mouthOpen: 0.2, // teeth close together
      jawOpen: 0.2,
      mouthClose: 0.7,
      jawClose: 0.7,
      teethOpen: 0.2
    },
    nn: {
      mouthOpen: 0.1, // almost closed
      jawOpen: 0.1,
      mouthClose: 0.8,
      jawClose: 0.8,
      teethOpen: 0.1
    },
    RR: {
      mouthOpen: 0.3, // tongue up
      jawOpen: 0.2,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    }
  };

  // Return the mapping for the given viseme, or default to closed mouth
  return visemeMapping[baseViseme] || visemeMapping.sil;
};

// UPDATED: Direct viseme morph targets - current viseme = 1, others = 0 
export const getAllVisemeMorphTargets = (currentViseme: string): Record<string, number> => {
  // Updated viseme list to match interface order
  const allVisemes = ['sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR', 'aa', 'E', 'I', 'O', 'U'];
  const baseViseme = currentViseme.replace('viseme_', '');

  const result: Record<string, number> = {};

  // Initialize all viseme morph targets to 0
  allVisemes.forEach(viseme => {
    result[`viseme_${viseme}`] = 0;
  });

  // Set current viseme to 1
  if (allVisemes.includes(baseViseme)) {
    result[`viseme_${baseViseme}`] = 1;
  } else {
    // Default to silence if viseme not found
    result['viseme_sil'] = 1;
  }

  // Add mouthOpen for backward compatibility
  result['mouthOpen'] = baseViseme === 'sil' ? 0 : 0.5;

  return result;
};

// RESTORED ORIGINAL: Generate mouth cues from wawa-lipsync viseme for compatibility
export const generateMouthCuesFromViseme = (viseme: string, currentTime: number, duration = 0.1): any[] => {
  const morphTargets = wawaVisemeToMorphTarget(viseme);

  // Convert morph target values to mouth cues format (ORIGINAL)
  const mouthCues = Object.entries(morphTargets).map(([target, value]) => ({
    start: currentTime,
    end: currentTime + duration,
    value: target,
    intensity: value
  }));

  return mouthCues;
};

// RESTORED ORIGINAL: Utility to get the most prominent morph target for the current viseme
export const getPrimaryMorphTarget = (viseme: string): string => {
  const morphTargets = wawaVisemeToMorphTarget(viseme);

  // Find the morph target with the highest value (ORIGINAL)
  const primaryTarget = Object.entries(morphTargets).reduce((max, [target, value]) => {
    return value > max.value ? { target, value } : max;
  }, { target: 'mouthClose', value: 0 });

  return primaryTarget.target;
};

// UPDATED: Direct viseme morph target translation using new mapping
export const translateVisemeToMorphTargets = (viseme: string): Record<string, number> => {
  // Use the new direct viseme mapping
  return wawaVisemeToMorphTarget(viseme);
};

// LEGACY: Traditional morph target translation for older models
export const translateVisemeToTraditionalMorphTargets = (viseme: string): Record<string, number> => {
  // Extract the base viseme from the full viseme string (e.g., "viseme_aa" -> "aa")
  const baseViseme = viseme.replace('viseme_', '');

  // Map each viseme to traditional model morph targets
  const visemeToMorphTargets: Record<string, Record<string, number>> = {
    sil: {
      mouthOpen: 0.0,
      jawOpen: 0.0,
      mouthClose: 1.0,
      jawClose: 1.0,
      teethOpen: 0.0
    },
    aa: {
      mouthOpen: 1.0,
      jawOpen: 0.8,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.9
    },
    I: {
      mouthOpen: 0.4,
      jawOpen: 0.3,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    },
    E: {
      mouthOpen: 0.6,
      jawOpen: 0.4,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.5
    },
    O: {
      mouthOpen: 0.8,
      jawOpen: 0.6,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.7
    },
    U: {
      mouthOpen: 0.7,
      jawOpen: 0.5,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.6
    },
    DD: {
      mouthOpen: 0.1,
      jawOpen: 0.1,
      mouthClose: 1.0,
      jawClose: 1.0,
      teethOpen: 0.1
    },
    PP: {
      mouthOpen: 0.1,
      jawOpen: 0.1,
      mouthClose: 1.0,
      jawClose: 1.0,
      teethOpen: 0.1
    },
    FF: {
      mouthOpen: 0.1,
      jawOpen: 0.1,
      mouthClose: 0.9,
      jawClose: 0.9,
      teethOpen: 0.1
    },
    TH: {
      mouthOpen: 0.3,
      jawOpen: 0.2,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    },
    kk: {
      mouthOpen: 0.1,
      jawOpen: 0.1,
      mouthClose: 1.0,
      jawClose: 1.0,
      teethOpen: 0.1
    },
    CH: {
      mouthOpen: 0.3,
      jawOpen: 0.2,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    },
    SS: {
      mouthOpen: 0.1,
      jawOpen: 0.1,
      mouthClose: 0.9,
      jawClose: 0.9,
      teethOpen: 0.1
    },
    nn: {
      mouthOpen: 0.1,
      jawOpen: 0.1,
      mouthClose: 0.9,
      jawClose: 0.9,
      teethOpen: 0.1
    },
    RR: {
      mouthOpen: 0.3,
      jawOpen: 0.2,
      mouthClose: 0.0,
      jawClose: 0.0,
      teethOpen: 0.3
    }
  };

  // Return the mapping for the given viseme, or default to closed mouth
  return visemeToMorphTargets[baseViseme] || visemeToMorphTargets.sil;
};
