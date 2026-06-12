import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const muscleColors: Record<string, string> = {
  Chest: '#ef4444',
  Back: '#3b82f6',
  Shoulders: '#f59e0b',
  Biceps: '#22c55e',
  Triceps: '#8b5cf6',
  Quadriceps: '#ec4899',
  Hamstrings: '#14b8a6',
  Glutes: '#f97316',
  Calves: '#6366f1',
  Abs: '#84cc16',
  Forearms: '#d946ef',
  Traps: '#f43f5e',
  Lats: '#0ea5e9',
};

const muscleIcons: Record<string, string> = {
  Chest: '🏋️',
  Back: '🚣',
  Shoulders: '🙆',
  Biceps: '💪',
  Triceps: '🦾',
  Quadriceps: '🦵',
  Hamstrings: '🦿',
  Glutes: '🍑',
  Calves: '🦶',
  Abs: '🧎',
  Forearms: '🤙',
  Traps: '🤷',
  Lats: '🦅',
};

function generateExerciseImage(name: string, muscleGroup: string): string {
  const color = muscleColors[muscleGroup] || '#7c3aed';
  const icon = muscleIcons[muscleGroup] || '🏋️';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" rx="20" fill="${color}" opacity="0.15"/>
  <rect width="400" height="400" rx="20" fill="none" stroke="${color}" stroke-width="2" opacity="0.3"/>
  <text x="200" y="180" text-anchor="middle" font-size="80">${icon}</text>
  <text x="200" y="240" text-anchor="middle" font-size="16" font-family="Inter, sans-serif" fill="${color}" font-weight="600">${name}</text>
  <text x="200" y="265" text-anchor="middle" font-size="12" font-family="Inter, sans-serif" fill="${color}" opacity="0.6">${muscleGroup}</text>
</svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const exercises = [
  // ========== 50 EXERCICES EXISTANTS ==========
  { name: "Seated Cable Row", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Lat Pulldown", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Pec Deck Fly", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Cable Lateral Raise", muscleGroup: "Shoulders", type: "UNILATERAL" },
  { name: "Barbell Preacher Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Incline DB Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "DB Lateral Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Reverse Pec Deck", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Dips", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Leg Press", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Leg Extension", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Supported Dips Machine", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Hack Squat", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Machine Shoulder Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Incline Bench Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Leg Curl", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Rope Hammer Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Reverse Cable Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Cable Overhead Extension", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Smith Incline Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Cable Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Bench Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Squat", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Deadlift", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Pull Up", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Barbell Row", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Front Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Face Pull", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Tricep Pushdown", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Skull Crusher", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Close Grip Bench", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Concentration Curl", muscleGroup: "Biceps", type: "UNILATERAL" },
  { name: "Hammer Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Calf Raise", muscleGroup: "Calves", type: "BILATERAL" },
  { name: "Glute Bridge", muscleGroup: "Glutes", type: "BILATERAL" },
  { name: "Hip Thrust", muscleGroup: "Glutes", type: "BILATERAL" },
  { name: "Bulgarian Split Squat", muscleGroup: "Quadriceps", type: "UNILATERAL" },
  { name: "Lunges", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Cable Crossover", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Decline Bench Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Arnold Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Upright Row", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Shrug", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Good Morning", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Pendlay Row", muscleGroup: "Back", type: "BILATERAL" },
  { name: "T-Bar Row", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Single Arm Cable Row", muscleGroup: "Back", type: "UNILATERAL" },
  { name: "Single Arm Pulldown", muscleGroup: "Back", type: "UNILATERAL" },

  // ========== 100 NOUVEAUX EXERCICES ==========
  // Chest (12)
  { name: "Flat DB Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Incline Cable Fly", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Decline Cable Fly", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Push Up", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Diamond Push Up", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Weighted Push Up", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Smith Flat Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Incline Smith Press", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Low Cable Fly", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "High Cable Fly", muscleGroup: "Chest", type: "BILATERAL" },
  { name: "Single Arm Cable Press", muscleGroup: "Chest", type: "UNILATERAL" },
  { name: "Svend Press", muscleGroup: "Chest", type: "BILATERAL" },

  // Back (16)
  { name: "Meadows Row", muscleGroup: "Back", type: "UNILATERAL" },
  { name: "Single Arm DB Row", muscleGroup: "Back", type: "UNILATERAL" },
  { name: "Inverted Row", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Chest Supported Row", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Wide Grip Pulldown", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Reverse Grip Pulldown", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Straight Arm Pulldown", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Rack Pull", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Snatch Grip Deadlift", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Sumo Deadlift", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Chin Up", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Neutral Grip Pull Up", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Kroc Row", muscleGroup: "Back", type: "UNILATERAL" },
  { name: "Dumbbell Pullover", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Barbell Pullover", muscleGroup: "Back", type: "BILATERAL" },
  { name: "Landmine Row", muscleGroup: "Back", type: "BILATERAL" },

  // Shoulders (14)
  { name: "Seated DB Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Standing Military Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Push Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Cable Front Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Single Arm Cable Lateral", muscleGroup: "Shoulders", type: "UNILATERAL" },
  { name: "Bent Over Lateral Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Seated Lateral Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Lu Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Cuban Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Z Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Bradford Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Behind Neck Press", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Plate Front Raise", muscleGroup: "Shoulders", type: "BILATERAL" },
  { name: "Y Raise", muscleGroup: "Shoulders", type: "BILATERAL" },

  // Biceps (10)
  { name: "Incline DB Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Spider Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Drag Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Zottman Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Cross Body Hammer Curl", muscleGroup: "Biceps", type: "UNILATERAL" },
  { name: "Cable High Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Bayesian Curl", muscleGroup: "Biceps", type: "UNILATERAL" },
  { name: "Chin Up Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "21s Curl", muscleGroup: "Biceps", type: "BILATERAL" },
  { name: "Waiter Curl", muscleGroup: "Biceps", type: "BILATERAL" },

  // Triceps (10)
  { name: "Overhead DB Extension", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Single Arm Pushdown", muscleGroup: "Triceps", type: "UNILATERAL" },
  { name: "Tate Press", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "JM Press", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "French Press", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Bench Dip", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Weighted Bench Dip", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Reverse Pushdown", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Cross Cable Extension", muscleGroup: "Triceps", type: "BILATERAL" },
  { name: "Kickback", muscleGroup: "Triceps", type: "BILATERAL" },

  // Quadriceps (8)
  { name: "Front Squat", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Goblet Squat", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Sissy Squat", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Step Up", muscleGroup: "Quadriceps", type: "UNILATERAL" },
  { name: "Single Leg Press", muscleGroup: "Quadriceps", type: "UNILATERAL" },
  { name: "Pistol Squat", muscleGroup: "Quadriceps", type: "UNILATERAL" },
  { name: "Reverse Lunge", muscleGroup: "Quadriceps", type: "BILATERAL" },
  { name: "Walking Lunge", muscleGroup: "Quadriceps", type: "BILATERAL" },

  // Hamstrings (6)
  { name: "Stiff Leg Deadlift", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Nordic Curl", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Single Leg Curl", muscleGroup: "Hamstrings", type: "UNILATERAL" },
  { name: "Seated Leg Curl", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Kettlebell Swing", muscleGroup: "Hamstrings", type: "BILATERAL" },
  { name: "Hip Hinge", muscleGroup: "Hamstrings", type: "BILATERAL" },

  // Glutes (6)
  { name: "Cable Kickback", muscleGroup: "Glutes", type: "UNILATERAL" },
  { name: "Abductor Machine", muscleGroup: "Glutes", type: "BILATERAL" },
  { name: "Frog Pump", muscleGroup: "Glutes", type: "BILATERAL" },
  { name: "Single Leg Bridge", muscleGroup: "Glutes", type: "UNILATERAL" },
  { name: "Donkey Kick", muscleGroup: "Glutes", type: "UNILATERAL" },
  { name: "Fire Hydrant", muscleGroup: "Glutes", type: "UNILATERAL" },

  // Calves (4)
  { name: "Seated Calf Raise", muscleGroup: "Calves", type: "BILATERAL" },
  { name: "Donkey Calf Raise", muscleGroup: "Calves", type: "BILATERAL" },
  { name: "Single Leg Calf Raise", muscleGroup: "Calves", type: "UNILATERAL" },
  { name: "Tibia Raise", muscleGroup: "Calves", type: "BILATERAL" },

  // Abs (10)
  { name: "Hanging Leg Raise", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Cable Crunch", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Ab Wheel Rollout", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Plank", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Side Plank", muscleGroup: "Abs", type: "UNILATERAL" },
  { name: "Russian Twist", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Dead Bug", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Dragon Flag", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Toes to Bar", muscleGroup: "Abs", type: "BILATERAL" },
  { name: "Pallof Press", muscleGroup: "Abs", type: "BILATERAL" },

  // Forearms (4)
  { name: "Wrist Curl", muscleGroup: "Forearms", type: "BILATERAL" },
  { name: "Reverse Wrist Curl", muscleGroup: "Forearms", type: "BILATERAL" },
  { name: "Farmer Walk", muscleGroup: "Forearms", type: "BILATERAL" },
  { name: "Plate Pinch", muscleGroup: "Forearms", type: "BILATERAL" },
];

async function main() {
  console.log('🌱 Seeding exercises with images...');
  
  // Supprimer d'abord les données qui référencent les exercices
  console.log('  🗑️  Deleting dependent data...');
  await prisma.sessionSet.deleteMany();
  await prisma.workoutSessionExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.exerciseSet.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.programItem.deleteMany();
  await prisma.exerciseRecord.deleteMany();
  
  // Maintenant on peut supprimer les exercices
  await prisma.exercise.deleteMany();
  console.log('  🗑️  Old exercises deleted');
  
  // Réinsérer les exercices
  for (const exercise of exercises) {
    const imageUrl = generateExerciseImage(exercise.name, exercise.muscleGroup);
    await prisma.exercise.create({
      data: { ...exercise, imageUrl }
    });
  }
  
  console.log(`✨ ${exercises.length} exercises seeded with images!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });