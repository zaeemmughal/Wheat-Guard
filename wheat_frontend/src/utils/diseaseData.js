export const DISEASES = {
  Brown_Rust: {
    label: 'Brown Rust',
    latin: 'Puccinia triticina',
    tagClass: 'tag-rust',
    color: '#c04a2a',
    colorBright: '#e06040',
    severity: 'High',
    description:
      'Brown rust (leaf rust) is one of the most widespread wheat diseases worldwide. It appears as small, round to oval, orange-brown pustules scattered across the upper leaf surface. In severe cases it can cause significant yield loss by reducing the photosynthetic area.',
    symptoms: [
      'Small circular to oval orange-brown pustules on upper leaf surface',
      'Yellow chlorotic halo surrounding pustules',
      'Pustules mainly on leaves, less on stems and glumes',
      'Premature leaf senescence under heavy infection',
    ],
    management: [
      'Use resistant cultivars — most effective long-term strategy',
      'Apply triazole or strobilurin fungicides at first signs',
      'Early planting to avoid peak spore periods',
      'Remove volunteer wheat plants as inoculum sources',
    ],
    conditions: 'Thrives in cool to moderate temperatures (15–22°C) with high humidity or leaf wetness periods exceeding 3–4 hours.',
    yield_loss: 'Up to 20–30% in susceptible varieties without treatment.',
    icon: '🟤',
  },
  Healthy: {
    label: 'Healthy',
    latin: 'No pathogen detected',
    tagClass: 'tag-green',
    color: '#5a9e54',
    colorBright: '#7ec97a',
    severity: 'None',
    description:
      'The wheat plant shows no signs of disease. Leaves are green, turgid, and free from lesions, pustules, or chlorosis. The crop is developing normally.',
    symptoms: [
      'Uniform green leaf colour',
      'No pustules, lesions, or necrotic patches',
      'Upright, firm stems and leaves',
      'Normal growth rate for the crop stage',
    ],
    management: [
      'Continue standard agronomic practices',
      'Monitor regularly — disease can appear quickly',
      'Maintain balanced nutrition, especially potassium',
      'Keep field records for resistance planning',
    ],
    conditions: 'Healthy crops are best maintained through balanced nutrition, appropriate sowing density, and regular scouting.',
    yield_loss: 'None — normal yield potential.',
    icon: '🌿',
  },
  Septoria: {
    label: 'Septoria',
    latin: 'Zymoseptoria tritici',
    tagClass: 'tag-septoria',
    color: '#7a5aa0',
    colorBright: '#b090d8',
    severity: 'High',
    description:
      'Septoria tritici blotch (STB) is the most economically damaging foliar disease of wheat in temperate climates. It spreads upward through the canopy during wet, cool conditions. Yield losses arise from destruction of the flag leaf and upper leaves during grain fill.',
    symptoms: [
      'Pale green to yellow water-soaked lesions on lower leaves initially',
      'Lesions turn brown and necrotic with irregular margins',
      'Tiny black pycnidia (fruiting bodies) visible within lesions',
      'Disease progresses upward through the canopy over time',
    ],
    management: [
      'Grow resistant varieties where available',
      'Apply fungicides (triazoles, SDHIs) at GS31–39 when conditions favour disease',
      'Avoid dense canopies — reduce seeding rates',
      'Rotate crops to reduce inoculum levels',
    ],
    conditions: 'Favoured by cool (10–20°C), wet, and cloudy weather. Rain splash disperses pycnidiospores upward through the canopy.',
    yield_loss: 'Can cause 30–50% yield loss in severe epidemic years.',
    icon: '🟣',
  },
  Yellow_Rust: {
    label: 'Yellow Rust',
    latin: 'Puccinia striiformis',
    tagClass: 'tag-amber',
    color: '#c8a820',
    colorBright: '#f0d040',
    severity: 'Very High',
    description:
      'Yellow rust (stripe rust) is the most destructive rust disease of wheat in cool, moist environments. Stripe-like patterns of bright yellow-orange pustules are the hallmark sign. Newer aggressive races have expanded its range into warmer climates.',
    symptoms: [
      'Bright yellow-orange stripe-like rows of pustules on leaves',
      'Stripes run parallel to leaf veins — distinctive pattern',
      'White to grey powdery spore masses in cool, moist conditions',
      'Severe yellowing and premature death of heavily infected leaves',
    ],
    management: [
      'Deploy resistant varieties — critical first line of defence',
      'Apply triazole fungicides at first pustule appearance',
      'Scout regularly during cool wet periods (October–April)',
      'Do not sow susceptible varieties in high-risk areas',
    ],
    conditions: 'Optimal development at 7–15°C with dew or light rain. Spores are airborne and can travel hundreds of kilometres.',
    yield_loss: 'Can cause 40–70% yield loss if untreated in susceptible varieties.',
    icon: '🟡',
  },
}

export const DISEASE_ORDER = ['Brown_Rust', 'Healthy', 'Septoria', 'Yellow_Rust']
