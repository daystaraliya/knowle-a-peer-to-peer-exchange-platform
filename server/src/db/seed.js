import { Achievement } from '../models/achievement.models.js';

const achievementsToSeed = [
    {
        name: 'First Exchange',
        description: 'You completed your very first knowledge exchange!',
        icon: '🤝',
        criteria: 'FIRST_EXCHANGE',
        points: 25,
    },
    {
        name: 'Knowledge Giver',
        description: 'Successfully completed 5 knowledge exchanges.',
        icon: '🎁',
        criteria: 'FIVE_EXCHANGES',
        points: 50,
    },
    {
        name: 'Serial Sharer',
        description: 'Successfully completed 10 knowledge exchanges.',
        icon: '🌟',
        criteria: 'TEN_EXCHANGES',
        points: 100,
    },
    {
        name: 'First Steps',
        description: 'Mastered your first skill in a Skill Tree.',
        icon: '🌱',
        criteria: 'FIRST_SKILL_NODE',
        points: 15,
    },
    {
        name: 'Project Pioneer',
        description: 'Started your first collaborative project.',
        icon: '🚀',
        criteria: 'FIRST_PROJECT',
        points: 40,
    },
];

export const seedAchievements = async () => {
    try {
        for (const achData of achievementsToSeed) {
            await Achievement.findOneAndUpdate(
                { criteria: achData.criteria },
                { $setOnInsert: achData },
                { upsert: true, new: true }
            );
        }
        console.log('Achievements have been seeded successfully.');
    } catch (error) {
        console.error('Error seeding achievements:', error);
    }
};
