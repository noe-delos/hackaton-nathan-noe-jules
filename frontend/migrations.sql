-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    participants TEXT[] NOT NULL DEFAULT '{}',
    messages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on updated_at for sorting
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Create index on participants for filtering
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert expanded sample data with different personalities
INSERT INTO conversations (title, participants, messages) VALUES 
(
    'John Doe',
    ARRAY['current-user', 'john-doe'],
    '[
        {
            "id": "1",
            "user_id": "john-doe",
            "content": "Hey there! How are you doing today? 😊",
            "date": "2024-01-20T10:00:00Z"
        },
        {
            "id": "2", 
            "user_id": "current-user",
            "content": "Hi John! I''m doing great, thanks for asking. How about you?",
            "date": "2024-01-20T10:05:00Z"
        },
        {
            "id": "3",
            "user_id": "john-doe", 
            "content": "I''m fantastic! Just finished an amazing workout and feeling super energized! What''s got you excited today?",
            "date": "2024-01-20T10:10:00Z"
        }
    ]'::jsonb
),
(
    'Sarah Wilson',
    ARRAY['current-user', 'sarah-wilson'],
    '[
        {
            "id": "4",
            "user_id": "sarah-wilson",
            "content": "Meeting scheduled for tomorrow at 2 PM. Please confirm attendance.",
            "date": "2024-01-20T14:30:00Z"
        },
        {
            "id": "5",
            "user_id": "current-user", 
            "content": "Yes, I''ll be there. Should I prepare anything specific?",
            "date": "2024-01-20T14:35:00Z"
        },
        {
            "id": "6",
            "user_id": "sarah-wilson", 
            "content": "Review Q4 reports. Bring printed copies for the team.",
            "date": "2024-01-20T14:40:00Z"
        }
    ]'::jsonb
),
(
    'Mike Brown',
    ARRAY['current-user', 'mike-brown'],
    '[
        {
            "id": "7",
            "user_id": "mike-brown",
            "content": "Hey buddy! Great work on the project. You''re crushing it! 👍",
            "date": "2024-01-20T16:00:00Z"
        },
        {
            "id": "8",
            "user_id": "current-user",
            "content": "Thanks Mike! Couldn''t have done it without the team support.",
            "date": "2024-01-20T16:05:00Z"
        },
        {
            "id": "9",
            "user_id": "mike-brown",
            "content": "That''s the spirit! Remember, we''re all here to help each other succeed. You got this!",
            "date": "2024-01-20T16:10:00Z"
        }
    ]'::jsonb
),
(
    'Emma Davis',
    ARRAY['current-user', 'emma-davis'],
    '[
        {
            "id": "10",
            "user_id": "emma-davis",
            "content": "OMG! Just had the most AMAZING idea for our next project! 🎨✨🚀",
            "date": "2024-01-21T09:15:00Z"
        },
        {
            "id": "11",
            "user_id": "current-user",
            "content": "That sounds exciting! What''s the idea?",
            "date": "2024-01-21T09:20:00Z"
        },
        {
            "id": "12",
            "user_id": "emma-davis",
            "content": "Picture this: a rainbow-colored dashboard that changes themes based on user mood! 🌈 Mind = BLOWN! 🤯",
            "date": "2024-01-21T09:25:00Z"
        }
    ]'::jsonb
),
(
    'Alex Johnson',
    ARRAY['current-user', 'alex-johnson'],
    '[
        {
            "id": "13",
            "user_id": "alex-johnson",
            "content": "I''ve been analyzing our user engagement metrics. Have you considered the correlation between session duration and feature adoption rates?",
            "date": "2024-01-21T11:30:00Z"
        },
        {
            "id": "14",
            "user_id": "current-user",
            "content": "That''s interesting. What patterns did you find?",
            "date": "2024-01-21T11:35:00Z"
        },
        {
            "id": "15",
            "user_id": "alex-johnson",
            "content": "Users with 15+ minute sessions show 340% higher feature adoption. This suggests we should optimize our onboarding flow. What are your thoughts on implementing progressive disclosure?",
            "date": "2024-01-21T11:40:00Z"
        }
    ]'::jsonb
),
(
    'Jessica Martinez',
    ARRAY['current-user', 'jessica-martinez'],
    '[
        {
            "id": "16",
            "user_id": "jessica-martinez",
            "content": "I noticed you''ve been working late lately. How are you feeling? Remember to take care of yourself! 💚",
            "date": "2024-01-21T18:00:00Z"
        },
        {
            "id": "17",
            "user_id": "current-user",
            "content": "Thanks for checking in! Yeah, it''s been a busy week.",
            "date": "2024-01-21T18:05:00Z"
        },
        {
            "id": "18",
            "user_id": "jessica-martinez",
            "content": "I understand completely. Just remember, you''re doing amazing work and it''s okay to rest. We all believe in you and want you to be happy and healthy! 🤗",
            "date": "2024-01-21T18:10:00Z"
        }
    ]'::jsonb
),
(
    'Team Project Alpha',
    ARRAY['current-user', 'john-doe', 'sarah-wilson', 'mike-brown'],
    '[
        {
            "id": "19",
            "user_id": "sarah-wilson",
            "content": "Project deadline moved to next Friday. Adjust timelines accordingly.",
            "date": "2024-01-22T09:00:00Z"
        },
        {
            "id": "20",
            "user_id": "mike-brown",
            "content": "No worries team! We''ve got this. Let''s break it down into smaller tasks and support each other!",
            "date": "2024-01-22T09:05:00Z"
        },
        {
            "id": "21",
            "user_id": "john-doe",
            "content": "Absolutely! I''m super excited to tackle this challenge together! Let''s make it amazing! 🔥",
            "date": "2024-01-22T09:07:00Z"
        }
    ]'::jsonb
),
(
    'Design Team Creative',
    ARRAY['current-user', 'emma-davis', 'jessica-martinez'],
    '[
        {
            "id": "22",
            "user_id": "emma-davis",
            "content": "New mood board is LIVE! 🎨 Check out these gorgeous color palettes I found! Purple + gold = perfection! ✨💜💛",
            "date": "2024-01-22T14:20:00Z"
        },
        {
            "id": "23",
            "user_id": "jessica-martinez",
            "content": "Emma, this is absolutely beautiful! I love how thoughtful you''ve been with the color psychology. The warmth really comes through! 😍",
            "date": "2024-01-22T14:25:00Z"
        },
        {
            "id": "24",
            "user_id": "current-user",
            "content": "Great work on this! The color combinations are really striking.",
            "date": "2024-01-22T14:30:00Z"
        }
    ]'::jsonb
);

-- Update the updated_at timestamps to show recent activity
UPDATE conversations SET updated_at = '2024-01-22T14:30:00Z' WHERE title = 'Design Team Creative';
UPDATE conversations SET updated_at = '2024-01-22T09:07:00Z' WHERE title = 'Team Project Alpha';
UPDATE conversations SET updated_at = '2024-01-21T18:10:00Z' WHERE title = 'Jessica Martinez';
UPDATE conversations SET updated_at = '2024-01-21T11:40:00Z' WHERE title = 'Alex Johnson';
UPDATE conversations SET updated_at = '2024-01-21T09:25:00Z' WHERE title = 'Emma Davis';
UPDATE conversations SET updated_at = '2024-01-20T16:10:00Z' WHERE title = 'Mike Brown';
UPDATE conversations SET updated_at = '2024-01-20T14:40:00Z' WHERE title = 'Sarah Wilson';
UPDATE conversations SET updated_at = '2024-01-20T10:10:00Z' WHERE title = 'John Doe'; 