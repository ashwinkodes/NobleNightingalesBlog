-- Drop existing tables if they exist
DROP TABLE IF EXISTS Likes;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS BlogPosts;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS BlogPostImages;

-- Create Users table
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    pwd TEXT NOT NULL,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    bday DATE NOT NULL,
    detail TEXT,
    avatarUrl TEXT,
    administrator BOOLEAN DEFAULT 0
);

-- Create BlogPosts table
CREATE TABLE BlogPosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    authorId INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create BlogPostImages table
CREATE TABLE BlogPostImages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blogPostId INTEGER NOT NULL,
    imageUrl TEXT NOT NULL,
    FOREIGN KEY (blogPostId) REFERENCES BlogPosts(id) ON DELETE CASCADE
);

-- Create Comments table
CREATE TABLE Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    blogPostId INTEGER NOT NULL,
    authorId INTEGER NOT NULL,
    parentCommentId INTEGER,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (blogPostId) REFERENCES BlogPosts(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCommentId) REFERENCES Comments(id) ON DELETE CASCADE
);

-- Create Likes table
CREATE TABLE Likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    blogPostId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (blogPostId) REFERENCES BlogPosts(id) ON DELETE CASCADE,
    UNIQUE(userId, blogPostId)
);

-- Insert sample data
-- First, insert Users
-- Password is 'testpwd'
INSERT INTO Users (fname, lname, username, pwd, bday, detail, administrator, avatarUrl) VALUES
    ('Ashwin', 'Kaushik', 'ashwink', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2001-03-22', 'Cyclist born in the USA', 1, '/public/upload/avatars/male.png'),
    ('Arjun', 'Kaushik', 'arjunk', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2001-03-22', 'Finance guy living in NYC', 0, '/public/upload/avatars/male.png'),
    ('Andrew', 'Meads', 'andrewm', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2000-03-22', 'CS719 Professor and lover of Pokemon', 1, '/public/upload/avatars/male.png'),
    ('Sandy', 'Zhai', 'sandyz', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2003-01-01', 'Student born in China', 1, '/public/upload/avatars/female.png'),
    ('Yu-Cheng', 'Tu', 'yuchengt', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2000-01-01', 'CS718 Professor and coffee lover', 1, '/public/upload/avatars/female.png'),
    ('David', 'Huang', 'davidh', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2000-01-01', 'CS718 assistant professor', 0, '/public/upload/avatars/male.png'),
    ('Renee', 'Cai', 'reneec', '$2a$10$M5omV63Xfvx.8hMFsb/M7OPudgbIBR/0sMhZFb8rnKzZAtM/iHuRm', '2003-01-01', 'Student also born in China', 1, '/public/upload/avatars/female.png');

-- Then, insert BlogPosts
INSERT INTO BlogPosts (title, content, excerpt, authorId, createdAt) VALUES
    ('Welcome to Noble Nightingales Blog', 'This is our first blog post. We''re excited to share our thoughts and experiences with you!', 'Welcome to our new blog!', 1, '2024-10-14T12:00:00Z'),
    ('Moving Abroad', 'Moving to a new country is an exciting yet challenging experience. It is a chance to explore a different culture, gain new perspectives, and open up personal and professional opportunities. Preparing well and staying open to change can make the transition smoother and help you settle into your new home more easily.
        <br><br> Start by researching your destination. Learning about the local culture, climate, cost of living, and key customs will help you feel more prepared. Understanding a bit about how things work in the country, from transportation to healthcare and local etiquette, will make it easier to adapt and help avoid culture shock.
        <br><br> Getting your paperwork in order is essential. Make sure your passport is valid and apply for any necessary visas or permits well in advance. Depending on the country, you may also need documents like proof of employment, medical records, or educational certificates. Having these ready and organized will save time and prevent last-minute issues.
        <br><br> Finding a place to live is often one of the biggest tasks when moving abroad. Some people choose to start with temporary accommodation like a hostel, Airbnb, or short-term rental to get familiar with the area before committing to a long-term lease. This allows you to explore neighborhoods and decide what works best for your needs and lifestyle. Local real estate websites or expat groups on social media can also be helpful in finding housing.
        <br><br> Learning a few basics of the local language will go a long way. Even knowing simple phrases like hello and thank you can help you feel more at ease and connect with locals. Language skills will help with everyday tasks like grocery shopping, transportation, and meeting new people, making it easier to build a sense of belonging.
        <br><br> Adapting to a new culture takes time, so be patient with yourself. It is normal to feel homesick or overwhelmed, but building a routine, exploring your surroundings, and making local friends can help. Many expats join clubs, sports teams, or volunteer groups to meet people and feel part of the community. Staying open to new experiences will enrich your journey and make settling in more enjoyable.
        <br><br> Finally, keep in touch with loved ones back home. Staying connected can ease the feeling of being far away and provide a support network as you adjust. Regular calls, emails, or sharing updates on social media can make the distance feel smaller and keep you grounded during this big change.
        <br><br>Moving abroad is a rewarding adventure that offers a world of growth and discovery. With preparation, an open mind, and a willingness to adapt, you can make the most of your new life in a new country. Embrace the journey and enjoy each step of your new experience.', 'Guide for First-Time Expats', 1, '2024-10-15T12:00:00Z'),
    ('The Art of Blogging', 'Blogging is a great way to express yourself and connect with others. In this post, we''ll discuss some tips for effective blogging.', 'Learn the essentials of great blogging', 2, '2024-10-14T13:00:00Z'),
    ('Learning a New Language', 'Learning a new language is a rewarding journey that opens up cultural, social, and professional opportunities. While the process can be challenging, these tips can make it easier and more enjoyable. <br><br> Start with common phrases rather than focusing on long vocabulary lists. Beginning with essential phrases and expressions used in daily conversation will provide a foundation and help you start speaking sooner. 
        Early attention to pronunciation is also valuable. Learning to pronounce words correctly from the start builds confidence and natural speaking habits. Using language apps or even working with a tutor can help with mastering these basics. <br><br> Consistent practice is key. Setting aside time every day, even just 10 to 15 minutes, maintains momentum and keeps the language fresh in your mind. Language apps like Duolingo or Memrise provide 
        quick lessons in vocabulary and grammar, making practice easy and even fun. <br><br> Immersing yourself in the language will help accelerate progress. Watching movies or listening to music in your target language lets you pick up natural expressions and improve listening comprehension. Practice with native speakers whenever possible. Apps like HelloTalk or Tandem make it easy to connect with people around the world. Conversations with native 
        speakers build familiarity with everyday slang, refine pronunciation, and deepen cultural understanding. <br><br> Do not fear mistakes. Embracing errors as part of the learning process is essential; perfection will come with time. The more you speak, write, and practice, the quicker you will improve. Asking for feedback from friends, tutors, or language partners can provide valuable insights and help refine your skills. <br><br> Setting small, 
        achievable goals will help you stay motivated. Breaking learning into steps, like learning 100 words or having a short conversation, can make progress easier to see. Regularly reviewing past material will reinforce your retention, keeping both vocabulary and grammar strong. <br><br> Learning a language is challenging but incredibly rewarding. With patience, daily practice, and curiosity, you will make steady progress toward fluency and be 
        ready to engage with the world in new ways. Enjoy the journey, and celebrate each milestone along the way', 'Tips to Learn a New Language', 2, '2024-10-15T13:00:00Z'),
    ('Studying at UoA', 'Studying at the University of Auckland is a great experience for many students, both international and domestic. Here we will discuss the professional and social dynamic of the school.', 'Get a better idea of UoA student life', 3, '2024-10-14T14:00:00Z'),
    ('Best Mountain Bikes of 2024', 'As technology advances, mountain bikes in 2024 are packed with features designed for better performance, durability, and rider comfort. From beginner-friendly trail bikes to aggressive enduro models, the top picks this year have something for every type of rider. Here is a look at some of the best mountain bikes of 2024 to help you find the right fit.
        <br><br> The Specialized Stumpjumper continues to dominate as one of the most versatile options for trail riding. Known for its balanced geometry and lightweight carbon frame, it delivers a nimble yet stable feel on diverse trails. With updated suspension and an efficient climbing platform, the 2024 Stumpjumper is perfect for riders looking for a high-performance, all-rounder.
        <br><br> For those seeking an all-mountain or enduro bike, the Yeti SB160 is a powerhouse. It is designed to tackle steep descents while still maintaining climbing efficiency. Equipped with the latest Switch Infinity suspension system, it offers impressive control on rough terrain and is ideal for advanced riders who want a bike that can handle aggressive riding.
        <br><br> The Trek Fuel EX is a popular choice among trail riders, especially for those who enjoy varied terrain. With adjustable geometry and updated frame design, the 2024 model adapts well to different trails and riding styles. It is especially appealing for riders who need a versatile bike that performs well on both climbs and descents.
        <br><br> Santa Cruz introduces the 2024 Megatower, an enduro-focused machine ready for serious downhill action. Built for stability at high speeds and enhanced with VPP suspension, this bike offers a smooth ride even on the rockiest trails. It is a great pick for experienced riders looking for a reliable, downhill-oriented setup. <br><br> For 
        entry-level riders, the Canyon Neuron AL is a fantastic option that combines quality and affordability. With a comfortable geometry and reliable component setup, it is designed to provide a smooth introduction to trail riding without breaking the bank. This model is well-suited for beginners or those on a budget who still want a capable trail bike. The lineup this year shows that 
        mountain bikes are pushing the limits of what riders can achieve on different terrains. <br><br> With improvements in suspension, geometry, and materials, the 2024 models offer something for everyone—from casual trail riders to seasoned enduro enthusiasts. Whether you are after a do-it-all trail bike or a downhill beast, these top models deliver high performance and durability for every adventure on the trail.', 'Explore the best, highest performing mountain bikes of 2024', 3, '2024-10-15T14:00:00Z'),
    ('Living in NZ', 'New Zealand is a beautiful country with a diverse culture and breathtaking scenery. From cities like Auckland to regions like Milford Sound.', 'Explore the country of New Zealand', 4, '2024-10-14T15:00:00Z'),
    ('Traveling the World', 'Traveling the world is a thrilling experience, offering a chance to explore diverse cultures, try new cuisines, and witness stunning landscapes. Whether you are planning a round-the-world adventure or a series of shorter trips, there are a few ways to get the most out of every destination.
        <br><br> Researching your destinations ahead of time is helpful, but staying flexible can make all the difference. While planning the must-see spots and key activities, leaving room for spontaneity allows you to discover hidden gems. Some of the most memorable experiences are often those unplanned moments found off the beaten path.
        <br><br> Budgeting wisely will stretch your funds further, making it possible to explore more places. Setting a daily budget and using a mix of affordable accommodations can help—hostels, guesthouses, and short-term rentals are all good options for balancing comfort with cost. Saving on food by visiting local markets or trying street food is not only affordable but also an authentic way to experience local cuisine.
        <br><br> Learning a few phrases in the local language can go a long way. Simple greetings or a quick thank you shows respect and opens doors to friendlier interactions. Local people often appreciate the effort, and a small connection can lead to valuable insights about the culture or even local recommendations you would not find in a guidebook.
        <br><br> Staying open to new experiences is key to making travel unforgettable. Trying unique foods, joining in local traditions, or saying yes to new opportunities will create a richer travel experience. Traveling is a time to step outside your comfort zone and embrace the unknown, discovering more about the world and yourself along the way.
        <br><br> Being a responsible traveler is also important. Respecting local customs, supporting small businesses, and being mindful of your environmental impact are all ways to travel responsibly. Choosing sustainable options helps preserve these incredible places for future travelers and makes a positive impact on the communities you visit.
        <br><br> Traveling the world is much more than seeing famous landmarks—it is an opportunity to learn, connect, and grow. With a bit of planning, an open mind, and a spirit of adventure, each journey becomes a meaningful experience that will stay with you forever. Embrace every moment, and enjoy the adventure.', 'Traveling is a time to step outside your comfort zone and embrace the unknown', 4, '2024-10-15T15:00:00Z');

-- Then, insert Comments
INSERT INTO Comments (content, blogPostId, authorId, createdAt) VALUES
    ('This is the first comment', (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog'), (SELECT id FROM Users WHERE username = 'ashwink'), '2024-10-15T12:30:00Z'),
    ('This is the PGCert Project', (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog'), (SELECT id FROM Users WHERE username = 'sandyz'), '2024-10-16T12:30:00Z'),
    ('Hopefully this works properly', (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog'), (SELECT id FROM Users WHERE username = 'andrewm'), '2024-10-15T12:30:00Z'),
    ('Hope you enjoy our site!', (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog'), (SELECT id FROM Users WHERE username = 'reneec'), '2024-10-16T12:30:00Z'),
    ('Blogging is fun', (SELECT id FROM BlogPosts WHERE title = 'The Art of Blogging'), (SELECT id FROM Users WHERE username = 'reneec'), '2024-10-16T12:30:00Z'),
    ('I love this!', (SELECT id FROM BlogPosts WHERE title = 'The Art of Blogging'), (SELECT id FROM Users WHERE username = 'yuchengt'), '2024-10-15T12:30:00Z'),
    ('Blogging is tough', (SELECT id FROM BlogPosts WHERE title = 'The Art of Blogging'), (SELECT id FROM Users WHERE username = 'davidh'), '2024-10-16T12:30:00Z'),
    ('This is nice', (SELECT id FROM BlogPosts WHERE title = 'The Art of Blogging'), (SELECT id FROM Users WHERE username = 'reneec'), '2024-10-15T12:30:00Z'),
    ('New Zealand is cool', (SELECT id FROM BlogPosts WHERE title = 'Studying at UoA'), (SELECT id FROM Users WHERE username = 'sandyz'), '2024-10-15T12:30:00Z'),
    ('I need to get out more', (SELECT id FROM BlogPosts WHERE title = 'Living in NZ'), (SELECT id FROM Users WHERE username = 'arjunk'), '2024-10-16T12:30:00Z'),
    ('Milford Sound is a destination spot', (SELECT id FROM BlogPosts WHERE title = 'Living in NZ'), (SELECT id FROM Users WHERE username = 'ashwink'), '2024-10-15T12:30:00Z'),
    ('Very helpful!', (SELECT id FROM BlogPosts WHERE title = 'Moving Abroad'), (SELECT id FROM Users WHERE username = 'sandyz'), '2024-10-15T12:30:00Z'),
    ('Thank you!', (SELECT id FROM BlogPosts WHERE title = 'Moving Abroad'), (SELECT id FROM Users WHERE username = 'reneec'), '2024-10-16T12:30:00Z'),
    ('Good things to keep in mind', (SELECT id FROM BlogPosts WHERE title = 'Moving Abroad'), (SELECT id FROM Users WHERE username = 'ashwink'), '2024-10-15T12:30:00Z'),
    ('I loved my Stumpy', (SELECT id FROM BlogPosts WHERE title = 'Best Mountain Bikes of 2024'), (SELECT id FROM Users WHERE username = 'ashwink'), '2024-10-16T12:30:00Z'),
    ('The SB160 is sweet', (SELECT id FROM BlogPosts WHERE title = 'Best Mountain Bikes of 2024'), (SELECT id FROM Users WHERE username = 'arjunk'), '2024-10-15T12:30:00Z'),
    ('Dentists favorite bikes', (SELECT id FROM BlogPosts WHERE title = 'Best Mountain Bikes of 2024'), (SELECT id FROM Users WHERE username = 'andrewm'), '2024-10-16T12:30:00Z'),
    ('Not all those who wander are lost', (SELECT id FROM BlogPosts WHERE title = 'Traveling the World'), (SELECT id FROM Users WHERE username = 'yuchengt'), '2024-10-15T12:30:00Z'),
    ('Jobs fill your pockets, adventures fill your soul', (SELECT id FROM BlogPosts WHERE title = 'Traveling the World'), (SELECT id FROM Users WHERE username = 'ashwink'), '2024-10-16T12:30:00Z'),
    ('Not all those who wander are lost', (SELECT id FROM BlogPosts WHERE title = 'Traveling the World'), (SELECT id FROM Users WHERE username = 'arjunk'), '2024-10-15T12:30:00Z'),
    ('The world is a book, and those who do not travel read only one page', (SELECT id FROM BlogPosts WHERE title = 'Traveling the World'), (SELECT id FROM Users WHERE username = 'davidh'), '2024-10-16T13:30:00Z');

-- Finally, insert Likes
INSERT INTO Likes (userId, blogPostId) VALUES
    (7, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (6, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (5, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (4, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (3, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (2, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (1, (SELECT id FROM BlogPosts WHERE title = 'Welcome to Noble Nightingales Blog')),
    (7, (SELECT id FROM BlogPosts WHERE title = 'Moving Abroad')),
    (6, (SELECT id FROM BlogPosts WHERE title = 'Moving Abroad')),
    (5, (SELECT id FROM BlogPosts WHERE title = 'The Art of Blogging')),
    (4, (SELECT id FROM BlogPosts WHERE title = 'Learning a New Language')),
    (3, (SELECT id FROM BlogPosts WHERE title = 'Best Mountain Bikes of 2024')),
    (2, (SELECT id FROM BlogPosts WHERE title = 'Best Mountain Bikes of 2024')),
    (1, (SELECT id FROM BlogPosts WHERE title = 'Best Mountain Bikes of 2024')),
    (7, (SELECT id FROM BlogPosts WHERE title = 'Studying at UoA')),
    (6, (SELECT id FROM BlogPosts WHERE title = 'Studying at UoA')),
    (5, (SELECT id FROM BlogPosts WHERE title = 'Living in NZ')),
    (4, (SELECT id FROM BlogPosts WHERE title = 'Living in NZ')),
    (3, (SELECT id FROM BlogPosts WHERE title = 'Living in NZ')),
    (2, (SELECT id FROM BlogPosts WHERE title = 'Living in NZ')),
    (1, (SELECT id FROM BlogPosts WHERE title = 'Living in NZ')),
    (7, (SELECT id FROM BlogPosts WHERE title = 'Traveling the World')),
    (6, (SELECT id FROM BlogPosts WHERE title = 'Traveling the World')),
    (5, (SELECT id FROM BlogPosts WHERE title = 'Traveling the World'));

-- Insert BlogPostImages
INSERT INTO BlogPostImages (blogPostId, imageUrl) VALUES
((SELECT id FROM BlogPosts WHERE title LIKE 'Welcome to Noble Nightingales Blog'), '/upload/blogposts/NobleNightingales.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'Moving Abroad'), '/upload/blogposts/movingabroad.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'The Art of Blogging'), '/upload/blogposts/business-blogging.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'Learning a New Language'), '/upload/blogposts/Language.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'Studying at UoA'), '/upload/blogposts/UoA.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'Best Mountain Bikes of 2024'), '/upload/blogposts/YetiSB160.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'Living in NZ'), '/upload/blogposts/Taranaki.jpg'),
((SELECT id FROM BlogPosts WHERE title LIKE 'Traveling the World'), '/upload/blogposts/Travel.jpg');