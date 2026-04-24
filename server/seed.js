require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Schema created successfully');

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['admin@memorial.com', hashedPassword, 'Memorial Admin']
    );
    const userId = userResult.rows[0].id;
    console.log('Demo user created: admin@memorial.com / password123');

    // Seed Obituaries (15 items)
    const obituaries = [
      { name: 'Margaret Eleanor Thompson', birth: '1935-03-15', death: '2024-11-02', city: 'Portland, OR', content: 'Margaret Eleanor Thompson, 89, of Portland, Oregon, passed peacefully on November 2, 2024, surrounded by her loving family. Born March 15, 1935, in Salem, Oregon, Margaret was a devoted mother, grandmother, and retired schoolteacher who touched countless lives through her 40 years of service at Lincoln Elementary. She is survived by her three children, seven grandchildren, and two great-grandchildren. Margaret was known for her warm smile, her legendary apple pie, and her unwavering dedication to education. A celebration of life will be held at Grace Community Church.', status: 'published' },
      { name: 'Robert James Wilson', birth: '1942-07-22', death: '2024-10-15', city: 'Chicago, IL', content: 'Robert James Wilson, 82, beloved husband, father, and veteran, passed away on October 15, 2024, in Chicago. Born July 22, 1942, Robert served proudly in the U.S. Army during Vietnam and later built a successful career in architecture. He designed several landmark buildings in downtown Chicago. Robert is survived by his wife of 55 years, Patricia, their four children, and nine grandchildren. He will be remembered for his quiet strength, his love of jazz, and his dedication to mentoring young architects.', status: 'published' },
      { name: 'Sarah Chen-Williams', birth: '1958-11-08', death: '2024-09-20', city: 'San Francisco, CA', content: 'Sarah Chen-Williams, 65, passed away September 20, 2024, after a courageous battle with cancer. Born in Taipei, Taiwan, Sarah immigrated to the United States in 1980 and built a remarkable life as a physician and community leader in San Francisco. She founded the Bay Area Free Clinic, providing healthcare to thousands of underserved patients. Sarah is survived by her husband David, daughters Emily and Grace, and her mother Li-Mei Chen.', status: 'published' },
      { name: 'William "Bill" O\'Brien', birth: '1950-04-30', death: '2024-08-12', city: 'Boston, MA', content: 'William "Bill" O\'Brien, 74, of Boston, Massachusetts, died August 12, 2024. A third-generation firefighter, Bill served the Boston Fire Department for 35 years, rising to the rank of Battalion Chief. He was a true hero who saved countless lives and mentored generations of firefighters. Bill is survived by his wife Mary, sons Patrick and Michael, and daughter Kathleen. His legacy of bravery and service will endure in the hearts of all who knew him.', status: 'published' },
      { name: 'Dorothy Mae Johnson', birth: '1928-12-25', death: '2024-11-10', city: 'Nashville, TN', content: 'Dorothy Mae Johnson, 95, of Nashville, Tennessee, went home to be with the Lord on November 10, 2024. Born on Christmas Day, 1928, Dorothy was a pillar of her community and a devoted member of First Baptist Church for over 70 years. She worked as a registered nurse at Vanderbilt Hospital and later volunteered extensively with Habitat for Humanity. Dorothy is preceded in death by her husband Earl and survived by her five children, fourteen grandchildren, and twenty-one great-grandchildren.', status: 'published' },
      { name: 'James Michael Rivera', birth: '1965-06-18', death: '2024-07-30', city: 'Miami, FL', content: 'James Michael Rivera, 59, of Miami, Florida, passed away unexpectedly on July 30, 2024. A beloved music teacher at Coral Gables High School, James inspired thousands of students to pursue their passion for music over his 30-year career. He directed award-winning marching bands and jazz ensembles. James is survived by his wife Rosa, daughters Isabella and Sofia, and his mother Carmen Rivera.', status: 'draft' },
      { name: 'Elizabeth Anne Foster', birth: '1940-02-14', death: '2024-10-28', city: 'Denver, CO', content: 'Elizabeth Anne Foster, 84, of Denver, Colorado, passed away peacefully on October 28, 2024. Born on Valentine\'s Day, Elizabeth lived a life full of love and adventure. A retired librarian and avid world traveler, she visited over 60 countries and could tell you a story about each one. She is survived by her partner of 30 years, Catherine Miller, her brother Thomas, and numerous nieces and nephews.', status: 'published' },
      { name: 'Ahmed Hassan Ali', birth: '1955-09-03', death: '2024-06-15', city: 'Houston, TX', content: 'Ahmed Hassan Ali, 68, of Houston, Texas, returned to Allah on June 15, 2024. Born in Cairo, Egypt, Ahmed came to America in 1978 to study engineering at Rice University and never left. He founded Ali Engineering Group, employing hundreds of people across Texas. Ahmed was a generous philanthropist who funded scholarships for immigrant students. He is survived by his wife Fatima, sons Omar and Kareem, and daughters Aisha and Noor.', status: 'published' },
      { name: 'Patricia Lynn Garcia', birth: '1948-08-21', death: '2024-09-05', city: 'Phoenix, AZ', content: 'Patricia Lynn Garcia, 76, of Phoenix, Arizona, died September 5, 2024. A retired judge and champion of justice, Patricia served on the Maricopa County Superior Court for 20 years. She was known for her fairness, compassion, and commitment to equal justice. Patricia is survived by her son Miguel, daughter Maria, and four grandchildren. Memorial donations may be made to the Arizona Legal Aid Foundation.', status: 'published' },
      { name: 'Henry David Nakamura', birth: '1938-01-10', death: '2024-08-22', city: 'Seattle, WA', content: 'Henry David Nakamura, 86, of Seattle, Washington, passed away August 22, 2024. A Japanese-American who survived internment as a child, Henry went on to become a distinguished professor of botany at the University of Washington. His research on Pacific Northwest ecosystems was groundbreaking. Henry is survived by his wife Yoko, children David and Susan, and six grandchildren. His beautiful garden at the family home stands as a living memorial to his life\'s work.', status: 'published' },
      { name: 'Gloria Jean Washington', birth: '1945-05-12', death: '2024-10-01', city: 'Atlanta, GA', content: 'Gloria Jean Washington, 79, of Atlanta, Georgia, passed away on October 1, 2024. A civil rights activist and educator, Gloria marched alongside Dr. Martin Luther King Jr. and later dedicated her life to education reform. She served as superintendent of Atlanta Public Schools for twelve years. Gloria is survived by her daughters Angela and Denise, son Marcus, and eight grandchildren.', status: 'published' },
      { name: 'Frank Anthony Russo', birth: '1952-03-28', death: '2024-07-18', city: 'New York, NY', content: 'Frank Anthony Russo, 72, of Brooklyn, New York, died July 18, 2024. The owner of Russo\'s Italian Bakery for over 40 years, Frank was a beloved fixture of the neighborhood. His cannoli were legendary, and his generosity to local families in need was even more so. Frank is survived by his wife Angela, sons Frank Jr. and Anthony, daughter Maria, and eleven grandchildren.', status: 'published' },
      { name: 'Susan Marie Larsen', birth: '1960-10-05', death: '2024-11-15', city: 'Minneapolis, MN', content: 'Susan Marie Larsen, 64, of Minneapolis, Minnesota, passed away November 15, 2024, after a long illness. A talented artist and art therapist, Susan used creativity to help hundreds of patients cope with trauma and illness. Her paintings hang in galleries across the Midwest. Susan is survived by her husband Erik, daughter Kristen, and her beloved golden retriever, Max.', status: 'draft' },
      { name: 'Charles Edward Brown III', birth: '1932-11-20', death: '2024-09-30', city: 'Charleston, SC', content: 'Charles Edward Brown III, 91, of Charleston, South Carolina, passed away peacefully on September 30, 2024. A decorated Korean War veteran and retired banker, Charles was a true Southern gentleman who served his community with distinction. He was a founding member of the Charleston Historical Preservation Society. Charles is survived by his children Elizabeth, Charles IV, and James, nine grandchildren, and three great-grandchildren.', status: 'published' },
      { name: 'Maria Teresa Santos', birth: '1970-07-04', death: '2024-10-20', city: 'Los Angeles, CA', content: 'Maria Teresa Santos, 54, of Los Angeles, California, passed away on October 20, 2024. A dedicated social worker and advocate for immigrant families, Maria spent 25 years helping families navigate the immigration system and build new lives in America. She was the heart of her community. Maria is survived by her husband Carlos, sons Daniel and Rafael, her mother Esperanza, and three siblings.', status: 'published' }
    ];

    for (const o of obituaries) {
      await pool.query(
        'INSERT INTO obituaries (user_id, deceased_name, birth_date, death_date, city, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, o.name, o.birth, o.death, o.city, o.content, o.status]
      );
    }
    console.log('Seeded 15 obituaries');

    // Seed Eulogies (15 items)
    const eulogies = [
      { name: 'Margaret Eleanor Thompson', relationship: 'Daughter', tone: 'Warm and loving', memories: 'Teaching us to bake, reading stories at bedtime, her garden', content: 'Mom always said that the measure of a life wasn\'t in years, but in the love you leave behind. Standing here today, looking at all of you who came to honor her, I think she measured up pretty well. Margaret Thompson was not just my mother — she was the heart of our family, the backbone of Lincoln Elementary, and the best friend anyone could ever hope to have. For forty years, she walked into that school every morning with the same mission: to make every child feel seen, heard, and capable of greatness...', status: 'final' },
      { name: 'Robert James Wilson', relationship: 'Son', tone: 'Respectful and proud', memories: 'Military service, building models together, Sunday jazz sessions', content: 'My father was a man of few words but enormous impact. Robert Wilson let his actions speak — in the jungles of Vietnam where he earned a Bronze Star, in the drafting rooms where he designed buildings that changed our skyline, and in our home where he was simply Dad. He taught me that strength isn\'t about being loud or forceful — it\'s about showing up, every single day, for the people who count on you...', status: 'final' },
      { name: 'Sarah Chen-Williams', relationship: 'Husband', tone: 'Loving and admiring', memories: 'Her determination, the clinic opening day, family dinners', content: 'Sarah came to this country with two suitcases and a dream. When I met her in medical school, she was already the most determined person in the room. She didn\'t just want to be a doctor — she wanted to change healthcare in America. And she did. The Bay Area Free Clinic has served over 50,000 patients since she founded it. But at home, she was simply my Sarah — the woman who laughed at my terrible jokes and made the best dumplings this side of Taipei...', status: 'final' },
      { name: 'William "Bill" O\'Brien', relationship: 'Fellow firefighter', tone: 'Heroic and heartfelt', memories: 'Training together, the warehouse fire rescue, his leadership', content: 'In the fire service, we talk a lot about courage. But Bill O\'Brien didn\'t just talk about it — he lived it every single shift for 35 years. I had the privilege of serving beside him for twenty of those years, and I can tell you that there was no one you\'d rather have at your side when things went bad. He ran toward danger when everyone else ran away. He pulled people from burning buildings with his bare hands when his gloves melted...', status: 'final' },
      { name: 'Dorothy Mae Johnson', relationship: 'Granddaughter', tone: 'Gentle and reverent', memories: 'Sunday dinners, church choir, her nursing stories', content: 'Grandma Dorothy was born on Christmas Day, and I think that was fitting because she spent her entire life being a gift to everyone around her. At 95 years old, she had seen the world change in ways most of us can hardly imagine. She lived through the Depression, World War II, the Civil Rights Movement, and the digital age — and through it all, her faith never wavered...', status: 'final' },
      { name: 'James Michael Rivera', relationship: 'Former student', tone: 'Grateful and emotional', memories: 'First music lesson, state competition, life advice', content: 'Mr. Rivera changed my life. I know that sounds dramatic, but it\'s the simple truth. When I walked into his band room as a shy freshman who could barely hold a trumpet, he saw something in me that I didn\'t see in myself. He didn\'t just teach me music — he taught me discipline, creativity, and the courage to perform in front of others...', status: 'draft' },
      { name: 'Elizabeth Anne Foster', relationship: 'Partner', tone: 'Tender and celebratory', memories: 'Traveling the world, library events, cooking together', content: 'Elizabeth once told me that the best stories are the ones you live, not just the ones you read. And oh, what a story she lived. In 84 years, she managed to visit 60 countries, read approximately 10,000 books, and touch every single life she encountered with her warmth and curiosity...', status: 'final' },
      { name: 'Ahmed Hassan Ali', relationship: 'Son', tone: 'Proud and grateful', memories: 'Immigration story, building the company, family values', content: 'My father came to this country with nothing but education and determination. He used to tell us the story of his first day at Rice University — how he got lost on campus and a stranger helped him find his way. "America welcomed me," he would say, "and I have spent my life trying to welcome others." That was Baba — always paying it forward...', status: 'final' },
      { name: 'Patricia Lynn Garcia', relationship: 'Colleague', tone: 'Professional and warm', memories: 'Landmark cases, mentoring, justice advocacy', content: 'Judge Garcia was a force of nature in the courtroom. I had the privilege of arguing cases before her for fifteen years, and every attorney who appeared in her court knew the same thing: you\'d better be prepared, you\'d better be honest, and you\'d better believe in justice. Because Patricia Garcia certainly did...', status: 'final' },
      { name: 'Henry David Nakamura', relationship: 'Daughter', tone: 'Reflective and poignant', memories: 'His garden, internment stories, university research', content: 'My father rarely spoke about the internment camp. But when he did, he would always end by saying, "The flowers still grew." That became the metaphor for his entire life — no matter what darkness surrounded him, he found a way to make things grow. His research garden at the university was his cathedral...', status: 'final' },
      { name: 'Gloria Jean Washington', relationship: 'Daughter', tone: 'Powerful and inspiring', memories: 'Civil rights marches, education reform, Sunday suppers', content: 'My mother marched with kings and taught with the patience of saints. Gloria Washington was a woman who believed that education was the most powerful weapon you could use to change the world — and she wielded it magnificently. From the streets of Selma to the superintendent\'s office, she never stopped fighting for what was right...', status: 'final' },
      { name: 'Frank Anthony Russo', relationship: 'Son', tone: 'Humorous and loving', memories: 'The bakery, neighborhood stories, family recipes', content: 'Pop used to say there were two things that could solve any problem: time and cannoli. And if the cannoli didn\'t work, you just needed more cannoli. Frank Russo wasn\'t just a baker — he was the unofficial mayor of our block, the therapist behind the counter, and the most generous man in Brooklyn...', status: 'final' },
      { name: 'Susan Marie Larsen', relationship: 'Husband', tone: 'Gentle and artistic', memories: 'Painting sessions, art therapy breakthroughs, her laugh', content: 'Susan saw the world differently than most people. Where others saw blank canvas, she saw possibility. Where others saw broken patients, she saw healing waiting to happen. She taught me that art isn\'t just about beauty — it\'s about truth, vulnerability, and the courage to express what words cannot...', status: 'final' },
      { name: 'Charles Edward Brown III', relationship: 'Grandson', tone: 'Distinguished and respectful', memories: 'War stories, banking career, historical preservation', content: 'Grandfather was the kind of man they don\'t make anymore — a true gentleman in every sense of the word. He fought for his country in Korea, built a bank that served his community for decades, and spent his retirement preserving the history of Charleston. He taught me that tradition isn\'t about living in the past — it\'s about honoring it while building the future...', status: 'final' },
      { name: 'Maria Teresa Santos', relationship: 'Sister', tone: 'Passionate and emotional', memories: 'Helping families, community events, her sacrifice', content: 'Mi hermana Maria had the biggest heart of anyone I have ever known. She dedicated her entire life to helping families like ours — families who came to this country with nothing but hope. She saw herself in every frightened mother, every confused father, every lost child. And she made it her mission to be the helping hand she wished someone had extended to us...', status: 'final' }
    ];

    for (const e of eulogies) {
      await pool.query(
        'INSERT INTO eulogies (user_id, deceased_name, relationship, tone, key_memories, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, e.name, e.relationship, e.tone, e.memories, e.content, e.status]
      );
    }
    console.log('Seeded 15 eulogies');

    // Seed Memorial Pages (15 items)
    const memorialPages = [
      { name: 'Margaret Eleanor Thompson', birth: '1935-03-15', death: '2024-11-02', bio: 'A beloved teacher, mother, and grandmother who dedicated 40 years to educating young minds at Lincoln Elementary in Portland, Oregon. Margaret\'s warmth and wisdom touched thousands of lives.', theme: 'classic', status: 'active' },
      { name: 'Robert James Wilson', birth: '1942-07-22', death: '2024-10-15', bio: 'Vietnam veteran and visionary architect who designed some of Chicago\'s most iconic buildings. A loving husband and father whose quiet strength inspired all who knew him.', theme: 'elegant', status: 'active' },
      { name: 'Sarah Chen-Williams', birth: '1958-11-08', death: '2024-09-20', bio: 'Physician, humanitarian, and founder of the Bay Area Free Clinic. Sarah\'s journey from Taipei to San Francisco is a story of determination, compassion, and extraordinary achievement.', theme: 'modern', status: 'active' },
      { name: 'William "Bill" O\'Brien', birth: '1950-04-30', death: '2024-08-12', bio: 'Third-generation Boston firefighter and Battalion Chief who served with distinction for 35 years. A true hero whose bravery saved countless lives.', theme: 'classic', status: 'active' },
      { name: 'Dorothy Mae Johnson', birth: '1928-12-25', death: '2024-11-10', bio: 'Born on Christmas Day, Dorothy spent 95 years spreading joy and serving others. A dedicated nurse, devoted church member, and beloved matriarch of a large and loving family.', theme: 'classic', status: 'active' },
      { name: 'James Michael Rivera', birth: '1965-06-18', death: '2024-07-30', bio: 'Award-winning music teacher who inspired thousands of students at Coral Gables High School. James\'s passion for music transformed a generation of young musicians.', theme: 'modern', status: 'active' },
      { name: 'Elizabeth Anne Foster', birth: '1940-02-14', death: '2024-10-28', bio: 'World traveler, retired librarian, and free spirit who visited over 60 countries. Elizabeth lived life to the fullest and inspired others to do the same.', theme: 'garden', status: 'active' },
      { name: 'Ahmed Hassan Ali', birth: '1955-09-03', death: '2024-06-15', bio: 'Egyptian-American engineer, entrepreneur, and philanthropist who built a business empire while never forgetting his roots. Ahmed\'s generosity funded scholarships for hundreds of immigrant students.', theme: 'elegant', status: 'active' },
      { name: 'Patricia Lynn Garcia', birth: '1948-08-21', death: '2024-09-05', bio: 'Distinguished judge who served on the Maricopa County Superior Court for 20 years. A champion of justice and equal rights who earned the respect of all who entered her courtroom.', theme: 'classic', status: 'active' },
      { name: 'Henry David Nakamura', birth: '1938-01-10', death: '2024-08-22', bio: 'Distinguished botanist, university professor, and Japanese-American internment survivor whose groundbreaking research on Pacific Northwest ecosystems advanced our understanding of the natural world.', theme: 'garden', status: 'active' },
      { name: 'Gloria Jean Washington', birth: '1945-05-12', death: '2024-10-01', bio: 'Civil rights activist and education pioneer who marched with Dr. King and later transformed Atlanta\'s public schools as superintendent. A fearless leader and loving mother.', theme: 'elegant', status: 'active' },
      { name: 'Frank Anthony Russo', birth: '1952-03-28', death: '2024-07-18', bio: 'Beloved Brooklyn baker whose Italian bakery was a neighborhood institution for over 40 years. Frank\'s generosity and famous cannoli made him a legend in his community.', theme: 'classic', status: 'active' },
      { name: 'Susan Marie Larsen', birth: '1960-10-05', death: '2024-11-15', bio: 'Talented artist and pioneering art therapist who used creativity to heal. Susan\'s paintings grace galleries across the Midwest, and her therapeutic methods helped hundreds of patients.', theme: 'modern', status: 'active' },
      { name: 'Charles Edward Brown III', birth: '1932-11-20', death: '2024-09-30', bio: 'Korean War veteran, respected banker, and passionate historical preservationist. A true Southern gentleman who served Charleston with distinction for nearly a century.', theme: 'classic', status: 'active' },
      { name: 'Maria Teresa Santos', birth: '1970-07-04', death: '2024-10-20', bio: 'Devoted social worker and immigrant rights advocate who spent 25 years helping families build new lives in America. Maria\'s compassion and dedication changed thousands of lives.', theme: 'modern', status: 'active' }
    ];

    for (const m of memorialPages) {
      await pool.query(
        'INSERT INTO memorial_pages (user_id, deceased_name, birth_date, death_date, biography, theme, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, m.name, m.birth, m.death, m.bio, m.theme, m.status]
      );
    }
    console.log('Seeded 15 memorial pages');

    // Seed Estate Items (15 items)
    const estateItems = [
      { name: 'Margaret Thompson', type: 'Legal Document', title: 'Last Will & Testament Filing', desc: 'File the original will with the county probate court. Document located in home safe.', status: 'completed', priority: 'high', assigned: 'Attorney James Miller', due: '2024-11-30' },
      { name: 'Margaret Thompson', type: 'Financial', title: 'Close Bank Accounts', desc: 'Close checking and savings accounts at Wells Fargo. Account numbers in estate folder.', status: 'in_progress', priority: 'high', assigned: 'Sarah Thompson', due: '2024-12-15' },
      { name: 'Margaret Thompson', type: 'Insurance', title: 'Life Insurance Claim', desc: 'File claim with MetLife. Policy #ML-456789. Beneficiary: Sarah Thompson.', status: 'completed', priority: 'high', assigned: 'Sarah Thompson', due: '2024-11-20' },
      { name: 'Robert Wilson', type: 'Property', title: 'Transfer Home Title', desc: 'Transfer ownership of family home at 1234 Oak Street to surviving spouse Patricia.', status: 'pending', priority: 'high', assigned: 'Estate Attorney', due: '2025-01-15' },
      { name: 'Robert Wilson', type: 'Financial', title: 'Retirement Account Distribution', desc: 'Process 401(k) and IRA distributions. Contact Fidelity Investments.', status: 'in_progress', priority: 'high', assigned: 'Financial Advisor', due: '2025-02-01' },
      { name: 'Robert Wilson', type: 'Digital Assets', title: 'Archive Digital Photos & Documents', desc: 'Backup all photos, documents, and architectural drawings from personal computer and cloud storage.', status: 'pending', priority: 'medium', assigned: 'Michael Wilson', due: '2025-01-30' },
      { name: 'Sarah Chen-Williams', type: 'Business', title: 'Clinic Ownership Transfer', desc: 'Transfer Bay Area Free Clinic management to board of directors as outlined in operating agreement.', status: 'in_progress', priority: 'high', assigned: 'Business Attorney', due: '2025-01-01' },
      { name: 'Sarah Chen-Williams', type: 'Legal Document', title: 'Medical License Notification', desc: 'Notify California Medical Board of Dr. Chen-Williams\' passing. License #MD-123456.', status: 'completed', priority: 'medium', assigned: 'David Williams', due: '2024-10-15' },
      { name: 'Dorothy Johnson', type: 'Financial', title: 'Social Security Notification', desc: 'Notify Social Security Administration and apply for survivor benefits for eligible dependents.', status: 'completed', priority: 'high', assigned: 'James Johnson', due: '2024-11-25' },
      { name: 'Dorothy Johnson', type: 'Property', title: 'Vehicle Title Transfer', desc: 'Transfer title of 2020 Toyota Camry to eldest son James Johnson.', status: 'pending', priority: 'low', assigned: 'James Johnson', due: '2025-02-15' },
      { name: 'Ahmed Ali', type: 'Business', title: 'Company Succession Plan', desc: 'Execute succession plan for Ali Engineering Group. Transfer to sons Omar and Kareem as outlined in agreement.', status: 'in_progress', priority: 'high', assigned: 'Corporate Attorney', due: '2025-03-01' },
      { name: 'Ahmed Ali', type: 'International', title: 'Egyptian Property Management', desc: 'Coordinate with Cairo attorney regarding family property in Egypt.', status: 'pending', priority: 'medium', assigned: 'International Attorney', due: '2025-04-01' },
      { name: 'Frank Russo', type: 'Business', title: 'Bakery Lease Transfer', desc: 'Transfer commercial lease for Russo\'s Italian Bakery to Frank Jr.', status: 'in_progress', priority: 'high', assigned: 'Frank Russo Jr.', due: '2025-01-15' },
      { name: 'Charles Brown III', type: 'Trust', title: 'Family Trust Distribution', desc: 'Execute distributions from the Brown Family Trust as outlined in trust documents.', status: 'pending', priority: 'high', assigned: 'Trust Attorney', due: '2025-03-15' },
      { name: 'Maria Santos', type: 'Financial', title: 'Cancel Subscriptions & Memberships', desc: 'Cancel all recurring subscriptions, gym membership, professional associations, and streaming services.', status: 'completed', priority: 'low', assigned: 'Carlos Santos', due: '2024-11-30' }
    ];

    for (const e of estateItems) {
      await pool.query(
        'INSERT INTO estate_items (user_id, deceased_name, item_type, title, description, status, priority, assigned_to, due_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [userId, e.name, e.type, e.title, e.desc, e.status, e.priority, e.assigned, e.due]
      );
    }
    console.log('Seeded 15 estate items');

    // Seed Grief Support (15 items)
    const griefSupport = [
      { topic: 'Coping with sudden loss', message: 'My mother passed away suddenly and I don\'t know how to process this.', response: 'I\'m so deeply sorry for the sudden loss of your mother. The shock of an unexpected loss can make the grief feel overwhelming and disorienting. Please know that what you\'re feeling right now — the disbelief, the confusion, the waves of sadness — these are all completely normal responses to an extraordinary loss. There is no "right" way to grieve. Allow yourself to feel whatever comes, without judgment. Consider reaching out to a grief counselor who specializes in sudden loss, and lean on your support network during this difficult time.', mood: 'devastated', session_type: 'crisis' },
      { topic: 'First holidays without a loved one', message: 'Thanksgiving is coming and my dad won\'t be there. How do I get through it?', response: 'The first holidays without a loved one are among the most challenging experiences in the grief journey. Your father\'s absence will be felt deeply, and that\'s okay. Here are some ways to navigate this: Consider setting a place for your father at the table or lighting a candle in his memory. Share your favorite memories of holidays with him. It\'s perfectly acceptable to modify traditions or create new ones. Most importantly, communicate with your family about what you need, and give yourself permission to step away if emotions become overwhelming.', mood: 'anxious', session_type: 'seasonal' },
      { topic: 'Grief affecting work performance', message: 'I can\'t concentrate at work since my wife died. My boss is losing patience.', response: 'Grief can significantly impact cognitive function, including concentration, memory, and decision-making. This is sometimes called "grief brain" and it is a well-documented phenomenon. I would encourage you to have an honest conversation with your HR department about bereavement support options. Many workplaces offer employee assistance programs (EAP) that provide free counseling sessions. Consider asking for temporary accommodations such as reduced workload, flexible hours, or the ability to work from home on difficult days.', mood: 'stressed', session_type: 'practical' },
      { topic: 'Children grieving a parent', message: 'How do I explain death to my 5-year-old? She keeps asking when daddy is coming home.', response: 'Explaining death to a young child requires honesty wrapped in gentleness. At age 5, children are beginning to understand that death is permanent, but they may not fully grasp it. Use simple, clear language: "Daddy\'s body stopped working, and he can\'t come back. This makes us very sad." Avoid euphemisms like "went to sleep" or "went away" as these can create fear and confusion. Let her ask questions and answer them honestly. Maintain her routines as much as possible, and reassure her frequently that she is loved and safe.', mood: 'heartbroken', session_type: 'family' },
      { topic: 'Guilt after a loved one\'s death', message: 'I feel so guilty. We had an argument the week before my brother died and I never apologized.', response: 'The guilt you\'re experiencing is a common and painful part of grief, especially when there were unresolved issues. Please hear this: your brother knew you loved him. One argument does not define your relationship — the years of love, shared experiences, and brotherhood do. Guilt can be grief\'s way of trying to maintain a connection with our loved one. Consider writing a letter to your brother expressing what you wish you\'d said. Many people find this practice healing. Your brother would not want you to carry this burden.', mood: 'guilty', session_type: 'emotional' },
      { topic: 'Anniversary of a death', message: 'Tomorrow marks one year since my husband passed. I thought it would get easier.', response: 'The first anniversary of a loss is a significant milestone, and it\'s common to experience a resurgence of intense grief around this time. Grief doesn\'t follow a linear path — it comes in waves, and anniversaries can bring particularly strong ones. This doesn\'t mean you haven\'t made progress. Consider creating a meaningful ritual for tomorrow: visit a special place, look through photos, or do something your husband loved. Honor both your grief and your resilience.', mood: 'sad', session_type: 'milestone' },
      { topic: 'Moving forward without feeling guilty', message: 'I\'ve started dating again and I feel like I\'m betraying my late wife.', response: 'Moving forward in life after loss is not a betrayal — it is a testament to your capacity for love. Your late wife would likely want you to find happiness again. The love you shared doesn\'t diminish because you open your heart to someone new. Many people who have loved deeply find that they have an even greater appreciation for connection. Take things at your own pace, and know that it\'s okay to feel a mix of emotions. There is no timeline for when it\'s "appropriate" to date again.', mood: 'conflicted', session_type: 'general' },
      { topic: 'Grief and physical symptoms', message: 'Since my mother died, I can\'t sleep, I\'ve lost weight, and I have chest pains.', response: 'Grief manifests physically as well as emotionally, and what you\'re describing — insomnia, weight loss, and chest pains — are common physical responses to profound loss. However, I want to strongly encourage you to see your doctor about the chest pains, as it\'s important to rule out any medical concerns. For sleep, try establishing a calming bedtime routine and consider speaking with your doctor about short-term sleep support. For appetite, try small, frequent meals. Most importantly, please reach out to a grief counselor — your body is telling you it needs support.', mood: 'exhausted', session_type: 'health' },
      { topic: 'Losing a pet', message: 'People tell me it\'s "just a dog" but I\'m devastated after losing my companion of 14 years.', response: 'Your grief is absolutely valid. A pet who has been your companion for 14 years is a family member, a confidant, and a source of unconditional love. The bond between humans and animals is profound and well-documented. Don\'t let anyone minimize your loss. Allow yourself to grieve fully. Consider creating a memorial — a photo album, planting a tree, or making a donation to an animal shelter in their name. The love you shared with your dog was real and meaningful.', mood: 'sad', session_type: 'pet_loss' },
      { topic: 'Supporting a grieving friend', message: 'My best friend lost her child. I don\'t know what to say or do.', response: 'The loss of a child is considered one of the most devastating experiences a person can endure. Your instinct to help is beautiful, but know that there are no perfect words. Here\'s what helps: Be present — show up, even when it\'s uncomfortable. Say their child\'s name. Listen more than you speak. Offer specific help: "I\'m bringing dinner Tuesday" rather than "Let me know if you need anything." Avoid saying "everything happens for a reason" or comparing losses. Your consistent presence over weeks and months will mean more than any words.', mood: 'concerned', session_type: 'supporting_others' },
      { topic: 'Complicated grief', message: 'It\'s been three years and I still cry every day. Is something wrong with me?', response: 'Nothing is wrong with you, but what you\'re describing may be what professionals call "complicated grief" or "prolonged grief disorder." This affects about 10% of bereaved individuals and is characterized by persistent, intense grief that doesn\'t gradually ease over time. This is not a weakness — it\'s a recognized condition that responds well to specialized treatment. I would strongly encourage you to seek a therapist who specializes in complicated grief. Treatments like Complicated Grief Treatment (CGT) have shown remarkable results.', mood: 'hopeless', session_type: 'clinical' },
      { topic: 'Grief during COVID isolation', message: 'My father died during COVID and I couldn\'t even say goodbye. I\'m stuck in this grief.', response: 'The grief of those who lost loved ones during COVID carries an additional layer of trauma — the inability to be present, to say goodbye, to hold a proper funeral. This "disenfranchised grief" is real and profound. Please know that your father knew he was loved. Consider creating a belated memorial — a gathering of family and friends to share stories and find closure. Write him a letter saying everything you didn\'t get to say. The lack of a traditional goodbye doesn\'t diminish the love you shared or your right to grieve fully.', mood: 'angry', session_type: 'trauma' },
      { topic: 'Financial stress after loss', message: 'My husband handled all our finances. Now he\'s gone and I\'m overwhelmed with bills and paperwork.', response: 'Dealing with financial matters while grieving is incredibly stressful, and you\'re not alone in feeling overwhelmed. Here\'s a step-by-step approach: First, identify urgent deadlines — mortgage, utilities, insurance. Contact your bank about your husband\'s accounts. Reach out to Social Security about survivor benefits. Consider asking a trusted family member or friend to help sort through paperwork. Many communities offer free financial counseling for widows and widowers. Take it one day at a time — you don\'t have to figure everything out immediately.', mood: 'overwhelmed', session_type: 'practical' },
      { topic: 'Sibling grief', message: 'My sister was my best friend. Nobody understands the depth of sibling loss.', response: 'Sibling loss is often called "the forgotten grief" because society tends to focus on the parents\' or spouse\'s loss. But you have lost someone who shared your entire history — your childhood memories, your family traditions, your inside jokes. Your sister was likely one of the few people who truly understood your family dynamics. This is a profound and unique loss. Seek out sibling grief support groups where others understand this specific type of loss. Your grief deserves to be seen and honored.', mood: 'isolated', session_type: 'general' },
      { topic: 'Finding meaning after loss', message: 'Six months after losing my son, I\'m trying to find some purpose in going on.', response: 'The search for meaning after losing a child is one of the most courageous journeys a person can undertake. There is no pressure to find meaning on any timeline, and some days surviving is enough. Many bereaved parents have found purpose through honoring their child\'s memory — establishing scholarships, supporting causes their child cared about, or helping other grieving parents. Your son\'s life had meaning, and that meaning continues through you and everyone he touched. When you\'re ready, consider connecting with organizations like The Compassionate Friends.', mood: 'searching', session_type: 'existential' }
    ];

    for (const g of griefSupport) {
      await pool.query(
        'INSERT INTO grief_support (user_id, topic, message, ai_response, mood, session_type) VALUES ($1,$2,$3,$4,$5,$6)',
        [userId, g.topic, g.message, g.response, g.mood, g.session_type]
      );
    }
    console.log('Seeded 15 grief support entries');

    // Seed Funeral Programs (15 items)
    const funeralPrograms = [
      { name: 'Margaret Eleanor Thompson', date: '2024-11-08 10:00:00', type: 'traditional', venue: 'Grace Community Church, Portland, OR', officiant: 'Rev. David Mitchell', content: 'Prelude Music (9:30 AM)\nProcessional - "Amazing Grace"\nOpening Prayer - Rev. David Mitchell\nScripture Reading - Psalm 23\nHymn - "How Great Thou Art"\nEulogy - Sarah Thompson (Daughter)\nTribute - Lincoln Elementary Staff\nHymn - "In the Garden"\nClosing Prayer\nRecessional - "I\'ll Fly Away"', music: 'Amazing Grace, How Great Thou Art, In the Garden, I\'ll Fly Away', template: 'classic', status: 'final' },
      { name: 'Robert James Wilson', date: '2024-10-22 14:00:00', type: 'military', venue: 'National Memorial Chapel, Chicago, IL', officiant: 'Chaplain Thomas Reed', content: 'Military Honors Guard Assembly\nProcessional with Flag-Draped Casket\nNational Anthem\nOpening Words - Chaplain Reed\nScripture Reading - Isaiah 40:31\nEulogy - Robert Wilson Jr.\nMilitary Tribute - VFW Post 1234\n21-Gun Salute\nTaps\nFlag Folding Ceremony\nPresentation of Flag to Patricia Wilson\nClosing Prayer\nRecessional', music: 'National Anthem, Taps, God Bless America', template: 'military', status: 'final' },
      { name: 'Sarah Chen-Williams', date: '2024-09-28 11:00:00', type: 'celebration_of_life', venue: 'Bay Area Free Clinic Auditorium, San Francisco, CA', officiant: 'Dr. Michael Chang', content: 'Welcome & Opening Remarks - Dr. Michael Chang\nPhoto Slideshow - "What a Wonderful World"\nTribute from Medical Community\nPoem Reading - "When Great Trees Fall" by Maya Angelou\nEulogy - David Williams (Husband)\nTributes - Daughters Emily & Grace\nOpen Microphone Remembrances\nChinese Tea Ceremony of Remembrance\nClosing Words\nReception to Follow', music: 'What a Wonderful World, Bridge Over Troubled Water, Moonlight Sonata', template: 'modern', status: 'final' },
      { name: 'William "Bill" O\'Brien', date: '2024-08-18 10:00:00', type: 'catholic', venue: 'St. Patrick\'s Cathedral, Boston, MA', officiant: 'Father Michael Brennan', content: 'Receiving of the Body\nProcessional Hymn - "Be Not Afraid"\nSprinkling with Holy Water\nPlacing of the Pall\nOpening Prayer\nFirst Reading - Wisdom 3:1-9\nPsalm 23\nSecond Reading - Romans 8:31-39\nGospel - John 14:1-6\nHomily - Father Brennan\nEulogy - Patrick O\'Brien (Son)\nPrayers of the Faithful\nOffertory\nCommunion\nFinal Commendation\nRecessional - "On Eagle\'s Wings"', music: 'Be Not Afraid, On Eagle\'s Wings, Ave Maria, Irish Blessing', template: 'religious', status: 'final' },
      { name: 'Dorothy Mae Johnson', date: '2024-11-16 11:00:00', type: 'baptist', venue: 'First Baptist Church, Nashville, TN', officiant: 'Pastor James Washington', content: 'Musical Prelude - Church Choir\nProcessional\nScripture - John 11:25-26\nPrayer of Comfort\nSelection - "Going Up Yonder"\nReading of Obituary\nAcknowledgments\nSelection - "His Eye Is on the Sparrow"\nEulogy - Angela Johnson (Granddaughter)\nPastor\'s Remarks\nSelection - "I Won\'t Complain"\nBenediction\nRecessional - "When We All Get to Heaven"', music: 'Going Up Yonder, His Eye Is on the Sparrow, I Won\'t Complain', template: 'classic', status: 'final' },
      { name: 'James Michael Rivera', date: '2024-08-05 15:00:00', type: 'celebration_of_life', venue: 'Coral Gables High School Auditorium, Miami, FL', officiant: 'Principal Maria Fernandez', content: 'Musical Welcome - CGHS Jazz Ensemble\nOpening Remarks - Principal Fernandez\nVideo Tribute\nStudent Performances (3 pieces)\nEulogy - Rosa Rivera (Wife)\nTributes from Former Students\nFinal Performance - CGHS Marching Band\nClosing Words\nReception in School Courtyard', music: 'Student performances, Take Five, What a Wonderful World', template: 'modern', status: 'draft' },
      { name: 'Elizabeth Anne Foster', date: '2024-11-03 13:00:00', type: 'secular', venue: 'Denver Botanic Gardens, Denver, CO', officiant: 'Catherine Miller (Partner)', content: 'Gathering in the Garden\nWelcome - Catherine Miller\nPoem - "The Summer Day" by Mary Oliver\nMemorial Slideshow - World Travels\nTributes from Friends\nReading - Excerpt from "Wild" by Cheryl Strayed\nOpen Sharing Circle\nButterfly Release\nClosing Words\nGarden Reception', music: 'Somewhere Over the Rainbow, Here Comes the Sun, Clair de Lune', template: 'garden', status: 'final' },
      { name: 'Ahmed Hassan Ali', date: '2024-06-16 08:00:00', type: 'islamic', venue: 'Islamic Center of Houston, TX', officiant: 'Imam Abdullah Rashid', content: 'Ghusl (Ritual Washing) - Performed by male family members\nKafan (Shrouding)\nSalat al-Janazah (Funeral Prayer)\nOpening Takbir & Surah Al-Fatihah\nSecond Takbir & Salawat\nThird Takbir & Dua for Deceased\nFourth Takbir & Closing\nProcession to Memorial Oaks Cemetery\nBurial with Du\'a\nFamily Receives Condolences at Islamic Center', music: 'Quran recitation only (no musical instruments per Islamic tradition)', template: 'religious', status: 'final' },
      { name: 'Patricia Lynn Garcia', date: '2024-09-12 14:00:00', type: 'traditional', venue: 'Arizona Biltmore Resort, Phoenix, AZ', officiant: 'Judge Robert Chen', content: 'Welcome & Opening - Judge Robert Chen\nReading - "Justice" by Langston Hughes\nTribute from the Arizona Bar Association\nEulogy - Miguel Garcia (Son)\nTribute - Maria Garcia (Daughter)\nReflections from Former Law Clerks\nPoem - "Still I Rise" by Maya Angelou\nClosing Remarks\nReception to Follow', music: 'Canon in D, Somewhere, What the World Needs Now', template: 'elegant', status: 'final' },
      { name: 'Henry David Nakamura', date: '2024-08-30 10:00:00', type: 'buddhist', venue: 'Seattle Buddhist Temple, Seattle, WA', officiant: 'Rev. Kenji Yamamoto', content: 'Incense Offering & Bell\nChanting of Sutras\nDharma Message - Rev. Yamamoto\nEulogy - David Nakamura (Son)\nTribute - University of Washington Botany Department\nOkō (Incense Offering by Attendees)\nChanting of Nembutsu\nClosing Words\nProcession to Washelli Cemetery\nTree Planting Ceremony at University Garden', music: 'Buddhist chanting, Shakuhachi flute meditation', template: 'classic', status: 'final' },
      { name: 'Gloria Jean Washington', date: '2024-10-08 12:00:00', type: 'baptist', venue: 'Ebenezer Baptist Church, Atlanta, GA', officiant: 'Bishop Marcus Thompson', content: 'Musical Prelude - Church Choir\nProcessional - "We Shall Overcome"\nScripture Readings\nPrayer of Comfort\nSelection - "Precious Lord, Take My Hand"\nReading of Obituary & Acknowledgments\nTribute from Atlanta Public Schools\nSelection - "Total Praise"\nEulogy - Angela Washington (Daughter)\nBishop\'s Remarks\nSelection - "If I Can Help Somebody"\nBenediction\nRecessional - "We Shall Overcome"', music: 'We Shall Overcome, Precious Lord, Total Praise', template: 'classic', status: 'final' },
      { name: 'Frank Anthony Russo', date: '2024-07-24 10:00:00', type: 'catholic', venue: 'Our Lady of Mount Carmel, Brooklyn, NY', officiant: 'Father Giuseppe Moretti', content: 'Receiving of the Body\nProcessional - "Panis Angelicus"\nRite of Reception\nOpening Prayer\nFirst Reading - Ecclesiastes 3:1-8\nPsalm 116\nSecond Reading - 1 Corinthians 13\nGospel - Matthew 25:34-40\nHomily - Father Moretti\nEulogy - Frank Russo Jr.\nPrayers of the Faithful\nCommunion\nFinal Commendation\nRecessional - "Ave Maria"', music: 'Panis Angelicus, Ave Maria, Amazing Grace', template: 'religious', status: 'final' },
      { name: 'Susan Marie Larsen', date: '2024-11-22 14:00:00', type: 'celebration_of_life', venue: 'Walker Art Center, Minneapolis, MN', officiant: 'Dr. Anna Petersen', content: 'Art Gallery Walk - Susan\'s Works\nWelcome - Dr. Anna Petersen\nVideo: Susan\'s Art Therapy Journey\nPoem - "The Artist" by Shel Silverstein\nEulogy - Erik Larsen (Husband)\nTribute - Art Therapy Colleagues\nTribute - Former Patients\nLive Painting Collaboration\nClosing Words\nReception Among Susan\'s Artwork', music: 'Clair de Lune, Gymnopédie No. 1, Hallelujah', template: 'modern', status: 'final' },
      { name: 'Charles Edward Brown III', date: '2024-10-06 11:00:00', type: 'episcopal', venue: 'St. Philip\'s Church, Charleston, SC', officiant: 'Rev. William Addison', content: 'Organ Prelude\nProcessional Hymn - "For All the Saints"\nCollect\nOld Testament - Isaiah 25:6-9\nPsalm 121\nNew Testament - Revelation 21:1-7\nGospel - John 6:37-40\nHomily - Rev. Addison\nEulogy - Charles Brown IV (Grandson)\nApostles\' Creed\nPrayers of the People\nCommendation\nRecessional - "Jerusalem the Golden"\nMilitary Honors at Magnolia Cemetery', music: 'For All the Saints, Jerusalem the Golden, Jesu Joy of Man\'s Desiring', template: 'classic', status: 'final' },
      { name: 'Maria Teresa Santos', date: '2024-10-26 10:00:00', type: 'catholic', venue: 'Our Lady of the Angels Cathedral, Los Angeles, CA', officiant: 'Father Carlos Mendez', content: 'Recibimiento del Cuerpo\nProcessional - "De Colores"\nRite of Reception\nOpening Prayer (Bilingual)\nFirst Reading - Sabiduría 3:1-9\nPsalm 23 (Bilingual)\nSecond Reading - Romanos 8:35-39\nGospel - Juan 14:1-6\nHomily - Father Mendez (Bilingual)\nEulogy - Carlos Santos (Husband)\nTribute - LA Social Workers Association\nPrayers of the Faithful (Bilingual)\nCommunion\nFinal Commendation\nRecessional - "Pescador de Hombres"', music: 'De Colores, Pescador de Hombres, Ave María', template: 'religious', status: 'final' }
    ];

    for (const f of funeralPrograms) {
      await pool.query(
        'INSERT INTO funeral_programs (user_id, deceased_name, service_date, service_type, venue, officiant, program_content, music_selections, template, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [userId, f.name, f.date, f.type, f.venue, f.officiant, f.content, f.music, f.template, f.status]
      );
    }
    console.log('Seeded 15 funeral programs');

    // Seed Thank You Cards (15 items)
    const thankYouCards = [
      { recipient: 'The Mitchell Family', deceased: 'Margaret Thompson', relationship: 'Neighbors', gesture: 'Prepared meals for the family for two weeks', message: 'Dear Mitchell Family, Your incredible generosity in preparing meals for our family during this difficult time was a true blessing. Mom always spoke so fondly of you as neighbors, and your kindness has meant more to us than words can express. The home-cooked meals brought comfort and one less worry during our time of grief. With deepest gratitude, The Thompson Family', sent: true },
      { recipient: 'Dr. Emily Watson', deceased: 'Margaret Thompson', relationship: 'Colleague', gesture: 'Beautiful floral arrangement and heartfelt card', message: 'Dear Dr. Watson, Thank you so much for the stunning floral arrangement and your beautiful card. Your words about Mom\'s impact at Lincoln Elementary brought tears and smiles in equal measure. She treasured your friendship and professional partnership. Your tribute was truly meaningful. With warm appreciation, Sarah Thompson', sent: true },
      { recipient: 'VFW Post 1234', deceased: 'Robert Wilson', relationship: 'Fellow Veterans', gesture: 'Military honor guard and flag ceremony', message: 'Dear Members of VFW Post 1234, The military honors you provided at Robert\'s funeral were a fitting tribute to his service. The precision of the honor guard, the 21-gun salute, and the beautiful flag folding ceremony honored his memory with the dignity he deserved. Our family is deeply grateful. Respectfully, The Wilson Family', sent: true },
      { recipient: 'James & Lisa Chen', deceased: 'Sarah Chen-Williams', relationship: 'Family', gesture: 'Travel from Taiwan for the service and help with arrangements', message: 'Dear Uncle James and Aunt Lisa, Your journey from Taipei to be with us meant everything. Having family present during this time connected us to Mom\'s roots and brought immeasurable comfort. Your help with the traditional tea ceremony was beautiful. Mom would have been so touched. With love and gratitude, David, Emily, and Grace', sent: true },
      { recipient: 'Boston Fire Department', deceased: 'William O\'Brien', relationship: 'Colleagues', gesture: 'Full department honors and ongoing family support', message: 'Dear Chief Harrison and the Men and Women of BFD, The department\'s tribute to Bill was extraordinary. The fire engine procession, the bell ceremony, and the ongoing support from Station 7 have meant the world to our family. Bill was so proud to serve alongside each of you. You are truly a brotherhood. With heartfelt thanks, The O\'Brien Family', sent: true },
      { recipient: 'Martha Stewart', deceased: 'Dorothy Johnson', relationship: 'Church Friend', gesture: 'Organized the reception after the funeral', message: 'Dear Martha, Your tireless work organizing the reception after Mother\'s funeral was a gift beyond measure. The food was beautiful, the setup was perfect, and you made sure every detail was handled so our family could focus on being together. Mother always said you were the most dependable person she knew. With deep appreciation, The Johnson Family', sent: false },
      { recipient: 'Coral Gables High Music Department', deceased: 'James Rivera', relationship: 'Students & Colleagues', gesture: 'Student performances at the memorial', message: 'Dear CGHS Music Family, The student performances at James\'s memorial were the most beautiful tribute we could have imagined. Hearing the jazz ensemble and marching band play with such heart and skill was a testament to the incredible teacher and mentor he was. He is playing along with you in spirit. With love, Rosa, Isabella, and Sofia', sent: true },
      { recipient: 'Denver Public Library System', deceased: 'Elizabeth Foster', relationship: 'Former Employer', gesture: 'Memorial book collection in her name', message: 'Dear DPL Friends, The memorial book collection in Elizabeth\'s name is a gift she would have absolutely adored. There is no more fitting tribute to a woman who believed that libraries were the heart of civilization. Every reader who benefits from these books will carry forward her legacy. With grateful hearts, Catherine Miller and Family', sent: true },
      { recipient: 'Islamic Center of Houston', deceased: 'Ahmed Ali', relationship: 'Community', gesture: 'Arranged all funeral rites and provided meals', message: 'Dear Imam Rashid and the Islamic Center Community, Your compassionate guidance through the funeral rites and the community\'s outpouring of support — the meals, the prayers, the condolences — embodied the ummah at its finest. Ahmed loved this community deeply, and your care for our family honors his memory beautifully. Jazakum Allahu Khairan, The Ali Family', sent: true },
      { recipient: 'Arizona Bar Association', deceased: 'Patricia Garcia', relationship: 'Professional', gesture: 'Established scholarship in her name', message: 'Dear Arizona Bar Association, The Patricia Garcia Justice Scholarship is a tribute that perfectly captures her legacy. Nothing mattered more to Patricia than ensuring equal access to justice, and this scholarship will help the next generation of attorneys carry that torch. We are deeply honored. With sincere gratitude, Miguel and Maria Garcia', sent: true },
      { recipient: 'UW Botany Department', deceased: 'Henry Nakamura', relationship: 'Colleagues', gesture: 'Named a campus garden in his honor', message: 'Dear Colleagues, The dedication of the Nakamura Memorial Garden on campus is the most meaningful tribute our family could imagine. Dad spent his happiest hours in that garden, and knowing it will now bear his name and continue to serve students and researchers brings us immense comfort. With appreciation, David and Susan Nakamura', sent: true },
      { recipient: 'NAACP Atlanta Chapter', deceased: 'Gloria Washington', relationship: 'Organization', gesture: 'Lifetime Achievement Award posthumously', message: 'Dear Atlanta NAACP, The posthumous Lifetime Achievement Award honoring Gloria\'s decades of civil rights work is deeply meaningful to our family. Mom dedicated her life to the struggle for equality, and this recognition validates a legacy of courage and service. She would be humbled and honored. In solidarity, Angela, Denise, and Marcus Washington', sent: true },
      { recipient: 'Brooklyn Community Board', deceased: 'Frank Russo', relationship: 'Community', gesture: 'Named the block in his honor', message: 'Dear Community Board Members, Having the block officially recognized as "Frank Russo Way" is an honor our family will cherish forever. Pop loved Brooklyn with every fiber of his being, and knowing his name will be part of the neighborhood he called home for 50 years means everything. With deepest thanks, The Russo Family', sent: false },
      { recipient: 'Walker Art Center', deceased: 'Susan Larsen', relationship: 'Professional', gesture: 'Hosted the memorial and exhibited her work', message: 'Dear Walker Art Center, Hosting Susan\'s memorial surrounded by her artwork was the perfect farewell. She would have been thrilled to know her work was exhibited in one of the institutions she admired most. The care and attention to detail in the exhibition setup was extraordinary. With warm thanks, Erik Larsen', sent: true },
      { recipient: 'LA Immigration Legal Aid', deceased: 'Maria Santos', relationship: 'Colleagues', gesture: 'Continuing her unfinished cases and memorial fund', message: 'Dear Colleagues, Your commitment to continuing Maria\'s unfinished cases ensures that the families she was helping will not be abandoned. The memorial fund in her name will support the work she cared about most. Maria would be so proud of your dedication. Con mucho agradecimiento, Carlos, Daniel, and Rafael Santos', sent: true }
    ];

    for (const t of thankYouCards) {
      await pool.query(
        'INSERT INTO thank_you_cards (user_id, recipient_name, deceased_name, relationship, gift_or_gesture, message, sent) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, t.recipient, t.deceased, t.relationship, t.gesture, t.message, t.sent]
      );
    }
    console.log('Seeded 15 thank you cards');

    // Seed Condolence Letters (15 items)
    const condolenceLetters = [
      { recipient: 'Sarah Thompson', deceased: 'Margaret Thompson', relationship: 'Friend of family', tone: 'warm', content: 'Dear Sarah, I was deeply saddened to learn of your mother Margaret\'s passing. She was an extraordinary woman whose warmth and dedication to education touched so many lives, including my own children who were fortunate to have her as their teacher. Her gentle spirit and unwavering commitment to her students set an example that will endure for generations. Please know that our family holds yours in our thoughts and prayers during this difficult time. If there is anything we can do — meals, errands, or simply a listening ear — please don\'t hesitate to reach out. With deepest sympathy, The Anderson Family', status: 'sent' },
      { recipient: 'Patricia Wilson', deceased: 'Robert Wilson', relationship: 'Colleague', tone: 'respectful', content: 'Dear Patricia, Words cannot adequately express my sorrow at Robert\'s passing. As his colleague at the firm for over twenty years, I witnessed firsthand his brilliant architectural mind and his even more impressive character. Robert approached every project — and every person — with the same quiet integrity and thoughtfulness. His designs will stand for decades, but his kindness will live on even longer in the hearts of those who knew him. Our thoughts are with you and your family. Sincerely, Thomas Hendricks, AIA', status: 'sent' },
      { recipient: 'David Williams', deceased: 'Sarah Chen-Williams', relationship: 'Patient', tone: 'grateful', content: 'Dear Mr. Williams, I am writing to express my heartfelt condolences on the loss of Dr. Chen-Williams. Ten years ago, when I had no insurance and nowhere to turn, she opened the doors of the Bay Area Free Clinic to me and quite literally saved my life. Her compassion went far beyond medicine — she helped me find housing, connected me with social services, and restored my faith in humanity. The world has lost a true healer. With profound gratitude and sympathy, Maria Gonzalez', status: 'sent' },
      { recipient: 'The O\'Brien Family', deceased: 'William O\'Brien', relationship: 'Neighbor', tone: 'heartfelt', content: 'Dear O\'Brien Family, Bill was more than a neighbor — he was the kind of man who made our entire block feel safe and cared for. Whether it was shoveling snow from our driveway without being asked, checking on us during storms, or simply waving hello with that big Irish smile, he embodied everything a good neighbor should be. We will miss him dearly. Please know that we are here for you, just as Bill was always there for us. With love, The Patel Family', status: 'sent' },
      { recipient: 'The Johnson Family', deceased: 'Dorothy Johnson', relationship: 'Church member', tone: 'spiritual', content: 'Dear Johnson Family, Sister Dorothy has gone home to glory, and while we grieve her absence from our pews, we celebrate the incredible life she lived. For over seventy years, she was the heartbeat of First Baptist Church. Her voice in the choir, her hands in the kitchen, her prayers for every member — she was a living testament to God\'s love. Heaven gained a beautiful soul. May the Lord comfort you with the same peace that Dorothy gave to so many. In Christ\'s love, Deacon Robert Harris', status: 'sent' },
      { recipient: 'Rosa Rivera', deceased: 'James Rivera', relationship: 'Parent of student', tone: 'grateful', content: 'Dear Mrs. Rivera, Our hearts are broken at the loss of Mr. Rivera. Our daughter came home from her first day in his band class and announced she wanted to be a musician. Eight years later, she is studying music at Juilliard — a dream that began in your husband\'s classroom. He didn\'t just teach music; he taught our daughter to believe in herself. We are forever grateful for his gift. With deepest sympathy, Michael and Jennifer Park', status: 'sent' },
      { recipient: 'Catherine Miller', deceased: 'Elizabeth Foster', relationship: 'Library patron', tone: 'warm', content: 'Dear Catherine, I never told Elizabeth this, but she changed my life. As a lonely teenager, I spent every afternoon at the library, and she always had a book recommendation ready for me. She seemed to know exactly what I needed to read next. Looking back, I realize she wasn\'t just recommending books — she was guiding a lost kid through literature toward self-discovery. I am who I am in part because of her quiet mentorship. Warmly, James Mitchell', status: 'sent' },
      { recipient: 'Fatima Ali', deceased: 'Ahmed Ali', relationship: 'Business partner', tone: 'respectful', content: 'Dear Fatima, Ahmed was not just my business partner — he was my mentor, my friend, and the most honorable man I have ever known. His handshake meant more than any contract, and his vision built something far greater than buildings. He built opportunities for hundreds of families. The engineering community has lost a giant, but his legacy will continue through the company he created and the lives he changed. May Allah grant him Jannah. With deepest respect, Thomas Chen', status: 'sent' },
      { recipient: 'Miguel Garcia', deceased: 'Patricia Garcia', relationship: 'Former law clerk', tone: 'professional', content: 'Dear Miguel, It was with profound sadness that I learned of Judge Garcia\'s passing. Clerking for your mother was the defining experience of my legal career. She taught me that justice isn\'t just about the law — it\'s about the people the law serves. Her fairness, wisdom, and compassion set the standard I strive to meet every day in my own practice. The bench has lost one of its finest. With sincere condolences, Attorney Jennifer Blackwell', status: 'sent' },
      { recipient: 'The Nakamura Family', deceased: 'Henry Nakamura', relationship: 'Former student', tone: 'reflective', content: 'Dear Nakamura Family, Professor Nakamura\'s Botany 301 was the class that changed my career path. His passion for plants was infectious, but it was his life story — his resilience, his grace, his ability to find beauty in the natural world despite everything he endured — that truly inspired me. I now run a botanical research lab, and every day I channel the curiosity and wonder he instilled in me. His garden grows on in all of us. Respectfully, Dr. Amanda Foster', status: 'sent' },
      { recipient: 'Angela Washington', deceased: 'Gloria Washington', relationship: 'Civil rights colleague', tone: 'powerful', content: 'Dear Angela, Your mother was a warrior, a visionary, and my dear friend. From the march on Selma to the halls of the school board, Gloria never wavered in her commitment to justice and education. She inspired me to keep fighting when I wanted to give up, and she showed all of us what real courage looks like. Her legacy is written in the lives of every student she championed and every barrier she broke. The struggle continues, and we carry her torch with pride. In solidarity, Rev. Dorothy Price', status: 'sent' },
      { recipient: 'Angela Russo', deceased: 'Frank Russo', relationship: 'Customer', tone: 'heartfelt', content: 'Dear Mrs. Russo, I\'ve been coming to Frank\'s bakery every Saturday morning for thirty years. It was never just about the bread — it was about the conversation, the laughter, the way Frank remembered everyone\'s name and asked about their families. He turned a simple bakery into a community living room. Saturday mornings will never be the same. Our neighborhood has lost its heart. With love and so many sweet memories, Helen Kowalski', status: 'sent' },
      { recipient: 'Erik Larsen', deceased: 'Susan Larsen', relationship: 'Art therapy patient', tone: 'grateful', content: 'Dear Erik, I want you to know that Susan saved my life. After my accident, I couldn\'t speak, couldn\'t express the pain and fear trapped inside me. Susan put a paintbrush in my hand and said, "Show me what you feel." In those art therapy sessions, she gave me a voice when I had lost mine. She saw beauty in broken things and taught me to see it too. I will carry her gift with me always. With eternal gratitude, Robert Chen', status: 'sent' },
      { recipient: 'The Brown Family', deceased: 'Charles Brown III', relationship: 'Historical society member', tone: 'distinguished', content: 'Dear Brown Family, Charles was the embodiment of Charleston\'s finest traditions — honor, service, and grace. His tireless work with the Historical Preservation Society saved numerous landmarks that tell our city\'s story. His encyclopedic knowledge of Charleston history, shared over countless committee meetings, educated and inspired all of us. The buildings he saved will stand as monuments to his dedication for centuries to come. With deepest admiration and sympathy, Margaret Rutledge, President, Charleston Historical Society', status: 'sent' },
      { recipient: 'Carlos Santos', deceased: 'Maria Santos', relationship: 'Client family', tone: 'emotional', content: 'Dear Carlos, Maria was our angel. When our family faced deportation, she fought for us like we were her own family. She stayed late, she made calls, she never gave up. Because of Maria, my children are in school, my husband has work, and we have a home. She gave us our American dream. We will never forget her, and we will honor her memory by helping others just as she helped us. Con todo nuestro amor, The Hernandez Family', status: 'sent' }
    ];

    for (const c of condolenceLetters) {
      await pool.query(
        'INSERT INTO condolence_letters (user_id, recipient_name, deceased_name, relationship, tone, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, c.recipient, c.deceased, c.relationship, c.tone, c.content, c.status]
      );
    }
    console.log('Seeded 15 condolence letters');

    // Seed Prayers & Readings (15 items)
    const prayersReadings = [
      { title: 'The Lord is My Shepherd', category: 'psalm', tradition: 'Christian', content: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.', source: 'Psalm 23 (KJV)', occasion: 'funeral' },
      { title: 'Do Not Stand at My Grave and Weep', category: 'poem', tradition: 'Secular', content: 'Do not stand at my grave and weep,\nI am not there; I do not sleep.\nI am a thousand winds that blow,\nI am the diamond glints on snow,\nI am the sun on ripened grain,\nI am the gentle autumn rain.\nWhen you awaken in the morning\'s hush\nI am the swift uplifting rush\nOf quiet birds in circling flight.\nI am the soft star-shine at night.\nDo not stand at my grave and cry,\nI am not there; I did not die.', source: 'Mary Elizabeth Frye', occasion: 'memorial' },
      { title: 'Al-Fatihah (The Opening)', category: 'prayer', tradition: 'Islamic', content: 'In the name of Allah, the Most Gracious, the Most Merciful.\nAll praise is due to Allah, Lord of all the worlds.\nThe Most Gracious, the Most Merciful.\nMaster of the Day of Judgment.\nYou alone we worship, and You alone we ask for help.\nGuide us on the Straight Path,\nThe path of those who have received Your grace;\nnot the path of those who have brought down wrath upon themselves,\nnor of those who have gone astray.', source: 'Quran, Surah 1', occasion: 'funeral' },
      { title: 'Heart Sutra (Excerpt)', category: 'sutra', tradition: 'Buddhist', content: 'Form is emptiness, emptiness is form.\nEmptiness is not separate from form,\nForm is not separate from emptiness.\nWhatever is form is emptiness,\nWhatever is emptiness is form.\nThe same is true with feelings, perceptions, mental formations, and consciousness.\nAll phenomena are marked with emptiness;\nThey are neither produced nor destroyed,\nNeither defiled nor immaculate,\nNeither increasing nor decreasing.', source: 'Prajnaparamita Heart Sutra', occasion: 'memorial' },
      { title: 'Kaddish (Mourner\'s Prayer)', category: 'prayer', tradition: 'Jewish', content: 'Glorified and sanctified be God\'s great name throughout the world which He has created according to His will. May He establish His kingdom in your lifetime and during your days, and within the life of the entire House of Israel, speedily and soon; and say, Amen. May His great name be blessed forever and to all eternity. Blessed and praised, glorified and exalted, extolled and honored, adored and lauded be the name of the Holy One, blessed be He, beyond all the blessings and hymns, praises and consolations that are ever spoken in the world; and say, Amen.', source: 'Traditional Jewish Liturgy', occasion: 'funeral' },
      { title: 'Remember Me', category: 'poem', tradition: 'Secular', content: 'Remember me when I am gone away,\nGone far away into the silent land;\nWhen you can no more hold me by the hand,\nNor I half turn to go yet turning stay.\nRemember me when no more day by day\nYou tell me of our future that you plann\'d:\nOnly remember me; you understand\nIt will be late to counsel then or pray.\nYet if you should forget me for a while\nAnd afterwards remember, do not grieve:\nFor if the darkness and corruption leave\nA vestige of the thoughts that once I had,\nBetter by far you should forget and smile\nThan that you should remember and be sad.', source: 'Christina Rossetti', occasion: 'memorial' },
      { title: 'Prayer of St. Francis', category: 'prayer', tradition: 'Catholic', content: 'Lord, make me an instrument of your peace:\nwhere there is hatred, let me sow love;\nwhere there is injury, pardon;\nwhere there is doubt, faith;\nwhere there is despair, hope;\nwhere there is darkness, light;\nwhere there is sadness, joy.\nO divine Master, grant that I may not so much seek\nto be consoled as to console,\nto be understood as to understand,\nto be loved as to love.\nFor it is in giving that we receive,\nit is in pardoning that we are pardoned,\nand it is in dying that we are born to eternal life. Amen.', source: 'Attributed to St. Francis of Assisi', occasion: 'funeral' },
      { title: 'When Great Trees Fall', category: 'poem', tradition: 'Secular', content: 'When great trees fall,\nrocks on distant hills shudder,\nlions hunker down in tall grasses,\nand even elephants lumber after safety.\n\nWhen great trees fall\nin forests,\nsmall things recoil into silence,\ntheir senses eroded beyond fear.\n\nWhen great souls die,\nthe air around us becomes light, rare, sterile.\nWe breathe, briefly.\nOur eyes, briefly, see with a hurtful clarity.\nOur memory, suddenly sharpened,\nexamines, gnaws on kind words unsaid,\npromised walks never taken.', source: 'Maya Angelou', occasion: 'memorial' },
      { title: 'Gayatri Mantra', category: 'mantra', tradition: 'Hindu', content: 'Om Bhur Bhuvaḥ Swaḥ\nTat-savitur Vareṇyaṃ\nBhargo Devasya Dhīmahi\nDhiyo Yonaḥ Prachodayāt\n\nTranslation:\nWe meditate on the glory of the Creator;\nWho has created the Universe;\nWho is worthy of Worship;\nWho is the embodiment of Knowledge and Light;\nWho is the remover of Sin and Ignorance;\nMay He open our hearts and enlighten our Intellect.', source: 'Rig Veda 3.62.10', occasion: 'funeral' },
      { title: 'Crossing the Bar', category: 'poem', tradition: 'Secular', content: 'Sunset and evening star,\nAnd one clear call for me!\nAnd may there be no moaning of the bar,\nWhen I put out to sea,\n\nBut such a tide as moving seems asleep,\nToo full for sound and foam,\nWhen that which drew from out the boundless deep\nTurns again home.\n\nTwilight and evening bell,\nAnd after that the dark!\nAnd may there be no sadness of farewell,\nWhen I embark;\n\nFor tho\' from out our bourne of Time and Place\nThe flood may bear me far,\nI hope to see my Pilot face to face\nWhen I have crost the bar.', source: 'Alfred Lord Tennyson', occasion: 'funeral' },
      { title: 'Apache Blessing', category: 'blessing', tradition: 'Native American', content: 'May the sun bring you new energy by day,\nmay the moon softly restore you by night,\nmay the rain wash away your worries,\nmay the breeze blow new strength into your being.\nMay you walk gently through the world and know\nits beauty all the days of your life.', source: 'Traditional Apache Prayer', occasion: 'memorial' },
      { title: 'Death is Nothing at All', category: 'sermon', tradition: 'Christian', content: 'Death is nothing at all.\nIt does not count.\nI have only slipped away into the next room.\nNothing has happened.\nEverything remains exactly as it was.\nI am I, and you are you,\nand the old life that we lived so fondly together is untouched, unchanged.\nWhatever we were to each other, that we are still.\nCall me by the old familiar name.\nSpeak of me in the easy way which you always used.\nPut no difference into your tone.\nWear no forced air of solemnity or sorrow.\nLaugh as we always laughed at the little jokes that we enjoyed together.\nPlay, smile, think of me, pray for me.\nLet my name be ever the household word that it always was.\nLet it be spoken without an effort, without the ghost of a shadow upon it.', source: 'Henry Scott Holland', occasion: 'funeral' },
      { title: 'Sikh Ardas (Closing Prayer)', category: 'prayer', tradition: 'Sikh', content: 'One Universal Creator God. By The Grace Of The True Guru:\nHaving first remembered God the Almighty,\nthink of Guru Nanak;\nThen of Guru Angad and Guru Amar Das,\nand Guru Ram Das — may they help us!\nRemember Guru Arjan, Guru Hargobind, and Siri Har Rai.\nRemember Siri Harkrishan,\nseeing whom all suffering vanishes.\nRemember Guru Teg Bahadur,\nand the nine treasures shall come running.\nMay they help us everywhere.\nMay the Tenth Master, Guru Gobind Singh, help us everywhere.', source: 'Traditional Sikh Prayer', occasion: 'funeral' },
      { title: 'The Summer Day', category: 'poem', tradition: 'Secular', content: 'Who made the world?\nWho made the swan, and the black bear?\nWho made the grasshopper?\nThis grasshopper, I mean—\nthe one who has flung herself out of the grass,\nthe one who is eating sugar out of my hand,\nwho is moving her jaws back and forth instead of up and down—\nwho is gazing around with her enormous and complicated eyes.\nNow she lifts her pale forearms and thoroughly washes her face.\nNow she snaps her wings open, and floats away.\nI don\'t know exactly what a prayer is.\nI do know how to pay attention, how to fall down\ninto the grass, how to kneel down in the grass,\nhow to be idle and blessed, how to stroll through the fields,\nwhich is what I have been doing all day.\nTell me, what else should I have done?\nDoesn\'t everything die at last, and too soon?\nTell me, what is it you plan to do\nwith your one wild and precious life?', source: 'Mary Oliver', occasion: 'celebration_of_life' },
      { title: 'Irish Blessing', category: 'blessing', tradition: 'Celtic', content: 'May the road rise up to meet you.\nMay the wind be always at your back.\nMay the sun shine warm upon your face;\nthe rains fall soft upon your fields\nand until we meet again,\nmay God hold you in the palm of His hand.\n\nMay God be with you and bless you,\nMay you see your children\'s children,\nMay you be poor in misfortune, rich in blessings.\nMay you know nothing but happiness\nFrom this day forward.\n\nMay the road rise up to meet you.\nMay the wind be always at your back.\nMay the warm rays of sun fall upon your home\nAnd may the hand of a friend always be near.\n\nMay green be the grass you walk on,\nMay blue be the skies above you,\nMay pure be the joys that surround you,\nMay true be the hearts that love you.', source: 'Traditional Irish Blessing', occasion: 'funeral' }
    ];

    for (const p of prayersReadings) {
      await pool.query(
        'INSERT INTO prayers_readings (user_id, title, category, tradition, content, source, occasion) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, p.title, p.category, p.tradition, p.content, p.source, p.occasion]
      );
    }
    console.log('Seeded 15 prayers & readings');

    // Seed Memorial Donations (15 items)
    const donations = [
      { deceased: 'Margaret Thompson', donor: 'The Mitchell Family', org: 'Lincoln Elementary PTA', amount: 500.00, message: 'In loving memory of a teacher who changed lives', status: 'received', date: '2024-11-05', thanks: true },
      { deceased: 'Margaret Thompson', donor: 'Portland Teachers Union', org: 'Scholarship Fund', amount: 2500.00, message: 'Margaret dedicated 40 years to education. This scholarship continues her legacy.', status: 'received', date: '2024-11-08', thanks: true },
      { deceased: 'Robert Wilson', donor: 'Chicago AIA Chapter', org: 'Architecture for Humanity', amount: 5000.00, message: 'Robert believed architecture should serve everyone. This gift honors that belief.', status: 'received', date: '2024-10-20', thanks: true },
      { deceased: 'Robert Wilson', donor: 'VFW Post 1234', org: 'Wounded Warrior Project', amount: 1000.00, message: 'In honor of a brave soldier and dedicated veteran', status: 'received', date: '2024-10-22', thanks: true },
      { deceased: 'Sarah Chen-Williams', donor: 'Bay Area Medical Association', org: 'Bay Area Free Clinic Endowment', amount: 25000.00, message: 'To ensure Dr. Chen-Williams\' clinic continues to serve those in need', status: 'received', date: '2024-09-25', thanks: true },
      { deceased: 'Sarah Chen-Williams', donor: 'Anonymous', org: 'Bay Area Free Clinic', amount: 10000.00, message: 'She saved my life. I hope this helps save others.', status: 'received', date: '2024-09-28', thanks: false },
      { deceased: 'William O\'Brien', donor: 'Boston Firefighters Local 718', org: 'National Fallen Firefighters Foundation', amount: 3000.00, message: 'For our brother Bill — a hero in every sense of the word', status: 'received', date: '2024-08-15', thanks: true },
      { deceased: 'Dorothy Johnson', donor: 'First Baptist Church Congregation', org: 'Habitat for Humanity Nashville', amount: 4500.00, message: 'Sister Dorothy built homes and built lives. This carries on her mission.', status: 'received', date: '2024-11-12', thanks: true },
      { deceased: 'James Rivera', donor: 'CGHS Class of 2010', org: 'Music Education Fund', amount: 7500.00, message: 'Mr. R taught us to make music. Now we help others find their song.', status: 'received', date: '2024-08-02', thanks: true },
      { deceased: 'Ahmed Ali', donor: 'Ali Engineering Group Employees', org: 'Rice University Immigrant Scholarship', amount: 50000.00, message: 'Honoring our founder\'s dream of education for all', status: 'received', date: '2024-06-20', thanks: true },
      { deceased: 'Patricia Garcia', donor: 'Arizona Bar Association', org: 'Legal Aid Foundation', amount: 15000.00, message: 'Justice for all — Judge Garcia\'s guiding principle', status: 'received', date: '2024-09-10', thanks: true },
      { deceased: 'Gloria Washington', donor: 'Atlanta Public Schools', org: 'Gloria Washington Education Fund', amount: 20000.00, message: 'Her legacy of educational excellence will continue to inspire generations', status: 'received', date: '2024-10-05', thanks: true },
      { deceased: 'Frank Russo', donor: 'Brooklyn Neighbors Association', org: 'Brooklyn Food Bank', amount: 2000.00, message: 'Frank fed the neighborhood for 40 years. Now we keep feeding it for him.', status: 'received', date: '2024-07-20', thanks: true },
      { deceased: 'Susan Larsen', donor: 'Minneapolis Art Community', org: 'Art Therapy Foundation', amount: 8000.00, message: 'Susan proved that art heals. This gift keeps that healing going.', status: 'received', date: '2024-11-18', thanks: false },
      { deceased: 'Maria Santos', donor: 'LA Immigration Law Network', org: 'Maria Santos Memorial Fund', amount: 12000.00, message: 'Continuing Maria\'s mission to help immigrant families build their American dream', status: 'received', date: '2024-10-25', thanks: true }
    ];

    for (const d of donations) {
      await pool.query(
        'INSERT INTO memorial_donations (user_id, deceased_name, donor_name, organization, amount, message, status, donation_date, thank_you_sent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [userId, d.deceased, d.donor, d.org, d.amount, d.message, d.status, d.date, d.thanks]
      );
    }
    console.log('Seeded 15 memorial donations');

    // Seed Photo Gallery
    const photos = [
      { deceased: 'Margaret Thompson', album: 'Family Memories', url: 'https://example.com/photos/margaret-family.jpg', caption: 'Margaret with her grandchildren at Christmas 2023' },
      { deceased: 'Margaret Thompson', album: 'Family Memories', url: 'https://example.com/photos/margaret-teaching.jpg', caption: 'Margaret in her classroom at Lincoln Elementary, 1975' },
      { deceased: 'Robert Wilson', album: 'Military Service', url: 'https://example.com/photos/robert-army.jpg', caption: 'Robert during his service in Vietnam, 1965' },
      { deceased: 'Robert Wilson', album: 'Architecture', url: 'https://example.com/photos/robert-building.jpg', caption: 'Robert at the opening of the Wilson Tower, 1995' },
      { deceased: 'Sarah Chen-Williams', album: 'Career', url: 'https://example.com/photos/sarah-clinic.jpg', caption: 'Sarah at the Bay Area Free Clinic grand opening' },
    ];
    for (const p of photos) {
      await pool.query(
        'INSERT INTO photo_gallery (user_id, deceased_name, album_name, photo_url, caption) VALUES ($1,$2,$3,$4,$5)',
        [userId, p.deceased, p.album, p.url, p.caption]
      );
    }
    console.log('Seeded 5 photo gallery items');

    // Seed Guest Book
    const guestEntries = [
      { deceased: 'Margaret Thompson', visitor: 'Emily Parker', email: 'emily.parker@email.com', message: 'Mrs. Thompson was my third-grade teacher. She changed my life. I became a teacher because of her.', approved: true },
      { deceased: 'Margaret Thompson', visitor: 'James Reed', email: 'jreed@email.com', message: 'We will miss you dearly, Aunt Margaret. Your apple pie recipe lives on in our family.', approved: true },
      { deceased: 'Robert Wilson', visitor: 'Tom Bradley', email: 'tbradley@email.com', message: 'Bob was my mentor at the architecture firm. His vision and kindness shaped my entire career.', approved: true },
      { deceased: 'Frank Russo', visitor: 'Maria Gonzalez', email: 'mgonzalez@email.com', message: 'Mr. Russo always gave us free bread when times were tough. A true angel of the neighborhood.', approved: true },
      { deceased: 'Dorothy Johnson', visitor: 'Pastor Williams', email: 'pwilliams@church.org', message: 'Sister Dorothy was the backbone of our congregation. Heaven has gained a mighty prayer warrior.', approved: true },
    ];
    for (const g of guestEntries) {
      await pool.query(
        'INSERT INTO guest_book_entries (user_id, deceased_name, visitor_name, visitor_email, message, is_approved) VALUES ($1,$2,$3,$4,$5,$6)',
        [userId, g.deceased, g.visitor, g.email, g.message, g.approved]
      );
    }
    console.log('Seeded 5 guest book entries');

    // Seed Service Checklists
    const checklists = [
      { deceased: 'Margaret Thompson', task: 'Contact funeral home', category: 'Before Service', completed: true, due: '2024-11-03', assigned: 'John Thompson' },
      { deceased: 'Margaret Thompson', task: 'Order flowers for the service', category: 'Before Service', completed: true, due: '2024-11-05', assigned: 'Sarah Thompson' },
      { deceased: 'Margaret Thompson', task: 'Prepare obituary for newspaper', category: 'Notifications', completed: true, due: '2024-11-04', assigned: 'Memorial Admin' },
      { deceased: 'Margaret Thompson', task: 'Arrange catering for reception', category: 'Day of Service', completed: false, due: '2024-11-07', assigned: 'Lisa Thompson' },
      { deceased: 'Margaret Thompson', task: 'File death certificate', category: 'Legal', completed: false, due: '2024-11-15', assigned: 'John Thompson' },
      { deceased: 'Margaret Thompson', task: 'Notify Social Security Administration', category: 'Financial', completed: false, due: '2024-11-20', assigned: 'John Thompson' },
      { deceased: 'Robert Wilson', task: 'Request military honors', category: 'Before Service', completed: true, due: '2024-10-17', assigned: 'Patricia Wilson' },
      { deceased: 'Robert Wilson', task: 'Contact VA for burial benefits', category: 'Financial', completed: true, due: '2024-10-18', assigned: 'Memorial Admin' },
    ];
    for (const c of checklists) {
      await pool.query(
        'INSERT INTO service_checklists (user_id, deceased_name, task_name, category, is_completed, due_date, assigned_to) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, c.deceased, c.task, c.category, c.completed, c.due, c.assigned]
      );
    }
    console.log('Seeded 8 service checklist items');

    // Seed Contacts
    const contactList = [
      { name: 'Grace Community Church', email: 'office@gracecommunity.org', phone: '503-555-0100', relationship: 'Clergy', address: '100 Oak Street', city: 'Portland', state: 'OR', zip: '97201' },
      { name: 'Evergreen Funeral Home', email: 'info@evergreenfh.com', phone: '503-555-0200', relationship: 'Funeral Home', address: '250 Elm Avenue', city: 'Portland', state: 'OR', zip: '97202' },
      { name: 'John Thompson', email: 'john.thompson@email.com', phone: '503-555-0301', relationship: 'Family', address: '45 Pine Road', city: 'Portland', state: 'OR', zip: '97203' },
      { name: 'Sarah Thompson-Lee', email: 'sarah.lee@email.com', phone: '503-555-0302', relationship: 'Family', address: '78 Cedar Lane', city: 'Lake Oswego', state: 'OR', zip: '97034' },
      { name: 'Attorney Richard Blake', email: 'rblake@blakelaw.com', phone: '503-555-0400', relationship: 'Attorney', address: '500 SW Morrison St, Suite 300', city: 'Portland', state: 'OR', zip: '97204' },
      { name: 'Patricia Wilson', email: 'pat.wilson@email.com', phone: '312-555-0100', relationship: 'Family', address: '1200 Lake Shore Dr', city: 'Chicago', state: 'IL', zip: '60601' },
    ];
    for (const c of contactList) {
      await pool.query(
        'INSERT INTO contacts (user_id, name, email, phone, relationship, address, city, state, zip) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [userId, c.name, c.email, c.phone, c.relationship, c.address, c.city, c.state, c.zip]
      );
    }
    console.log('Seeded 6 contacts');

    // Seed Timeline Events
    const timeline = [
      { deceased: 'Margaret Thompson', date: '1935-03-15', title: 'Born in Salem, Oregon', description: 'Margaret Eleanor was born to Edward and Rose Thompson in Salem, Oregon.', type: 'Birth', location: 'Salem, OR' },
      { deceased: 'Margaret Thompson', date: '1957-06-10', title: 'Graduated from University of Oregon', description: 'Earned a Bachelor of Education degree with honors.', type: 'Education', location: 'Eugene, OR' },
      { deceased: 'Margaret Thompson', date: '1959-08-20', title: 'Married Harold Thompson', description: 'Married her college sweetheart at Grace Community Church.', type: 'Marriage', location: 'Portland, OR' },
      { deceased: 'Margaret Thompson', date: '1960-09-01', title: 'Started teaching at Lincoln Elementary', description: 'Began her 40-year career as a beloved schoolteacher.', type: 'Career', location: 'Portland, OR' },
      { deceased: 'Margaret Thompson', date: '1985-05-15', title: 'Teacher of the Year Award', description: 'Received the Oregon Teacher of the Year award for her innovative reading programs.', type: 'Achievement', location: 'Salem, OR' },
      { deceased: 'Margaret Thompson', date: '2000-06-15', title: 'Retired from teaching', description: 'Retired after 40 years of dedicated service. Over 1,000 students attended her retirement celebration.', type: 'Milestone', location: 'Portland, OR' },
      { deceased: 'Robert Wilson', date: '1942-07-22', title: 'Born in Chicago', description: 'Robert James Wilson was born to James and Eleanor Wilson.', type: 'Birth', location: 'Chicago, IL' },
      { deceased: 'Robert Wilson', date: '1964-03-15', title: 'Deployed to Vietnam', description: 'Served in the U.S. Army with distinction.', type: 'Career', location: 'Vietnam' },
    ];
    for (const t of timeline) {
      await pool.query(
        'INSERT INTO timeline_events (user_id, deceased_name, event_date, title, description, event_type, location) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, t.deceased, t.date, t.title, t.description, t.type, t.location]
      );
    }
    console.log('Seeded 8 timeline events');

    // Seed Budget Items
    const budgetList = [
      { deceased: 'Margaret Thompson', category: 'Funeral Home', description: 'Evergreen Funeral Home services', estimated: 8500.00, actual: 8200.00, vendor: 'Evergreen Funeral Home', paid: true },
      { deceased: 'Margaret Thompson', category: 'Casket/Urn', description: 'Mahogany casket with satin interior', estimated: 3500.00, actual: 3200.00, vendor: 'Evergreen Funeral Home', paid: true },
      { deceased: 'Margaret Thompson', category: 'Flowers', description: 'Service arrangements and family wreath', estimated: 1200.00, actual: 1350.00, vendor: 'Portland Flower Market', paid: true },
      { deceased: 'Margaret Thompson', category: 'Catering', description: 'Reception for 150 guests', estimated: 2500.00, actual: null, vendor: 'Grace Kitchen Catering', paid: false },
      { deceased: 'Margaret Thompson', category: 'Cemetery', description: 'Burial plot and headstone', estimated: 5000.00, actual: 4800.00, vendor: 'River View Cemetery', paid: false },
      { deceased: 'Margaret Thompson', category: 'Obituary/Notices', description: 'Newspaper obituary and online postings', estimated: 500.00, actual: 450.00, vendor: 'The Oregonian', paid: true },
      { deceased: 'Margaret Thompson', category: 'Music', description: 'Organist and soloist for service', estimated: 600.00, actual: 600.00, vendor: 'Church musicians', paid: true },
      { deceased: 'Margaret Thompson', category: 'Printing', description: 'Programs, prayer cards, thank you cards', estimated: 400.00, actual: null, vendor: 'Quick Print Portland', paid: false },
    ];
    for (const b of budgetList) {
      await pool.query(
        'INSERT INTO budget_items (user_id, deceased_name, category, description, estimated_cost, actual_cost, vendor, paid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [userId, b.deceased, b.category, b.description, b.estimated, b.actual, b.vendor, b.paid]
      );
    }
    console.log('Seeded 8 budget items');

    // Seed Venues
    const venueList = [
      { deceased: 'Margaret Thompson', name: 'Grace Community Church', address: '100 Oak Street, Portland, OR 97201', phone: '503-555-0100', contact: 'Pastor David Miller', type: 'Church', capacity: 400, booked: true, date: '2024-11-08 10:00:00' },
      { deceased: 'Margaret Thompson', name: 'Evergreen Funeral Home', address: '250 Elm Avenue, Portland, OR 97202', phone: '503-555-0200', contact: 'Director James Evans', type: 'Funeral Home', capacity: 200, booked: true, date: '2024-11-07 14:00:00' },
      { deceased: 'Margaret Thompson', name: 'River View Cemetery', address: '8421 SW Macadam Ave, Portland, OR 97219', phone: '503-555-0500', contact: 'Office', type: 'Cemetery', capacity: null, booked: true, date: '2024-11-08 13:00:00' },
      { deceased: 'Margaret Thompson', name: 'Portland Garden Club', address: '300 Rose Garden Way, Portland, OR 97205', phone: '503-555-0600', contact: 'Events Coordinator', type: 'Reception Hall', capacity: 150, booked: true, date: '2024-11-08 14:30:00' },
    ];
    for (const v of venueList) {
      await pool.query(
        'INSERT INTO venues (user_id, deceased_name, name, address, phone, contact_person, venue_type, capacity, booked, event_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [userId, v.deceased, v.name, v.address, v.phone, v.contact, v.type, v.capacity, v.booked, v.date]
      );
    }
    console.log('Seeded 4 venues');

    // Seed Music Selections
    const musicList = [
      { deceased: 'Margaret Thompson', song: 'Amazing Grace', artist: 'Traditional Hymn', moment: 'Processional', order: 1 },
      { deceased: 'Margaret Thompson', song: 'How Great Thou Art', artist: 'Traditional Hymn', moment: 'During Service', order: 2 },
      { deceased: 'Margaret Thompson', song: 'Ave Maria', artist: 'Franz Schubert', moment: 'Reflection', order: 3 },
      { deceased: 'Margaret Thompson', song: 'Wind Beneath My Wings', artist: 'Bette Midler', moment: 'During Service', order: 4 },
      { deceased: 'Margaret Thompson', song: 'What a Wonderful World', artist: 'Louis Armstrong', moment: 'Recessional', order: 5 },
      { deceased: 'Robert Wilson', song: 'Taps', artist: 'Military Traditional', moment: 'Recessional', order: 1 },
      { deceased: 'Robert Wilson', song: 'Take Five', artist: 'Dave Brubeck', moment: 'Prelude', order: 2 },
      { deceased: 'Robert Wilson', song: 'My Way', artist: 'Frank Sinatra', moment: 'Reflection', order: 3 },
    ];
    for (const m of musicList) {
      await pool.query(
        'INSERT INTO music_selections (user_id, deceased_name, song_title, artist, service_moment, order_number) VALUES ($1,$2,$3,$4,$5,$6)',
        [userId, m.deceased, m.song, m.artist, m.moment, m.order]
      );
    }
    console.log('Seeded 8 music selections');

    // Seed RSVP Entries
    const rsvpList = [
      { deceased: 'Margaret Thompson', service: 'Memorial Service', guest: 'Emily Parker', email: 'emily.parker@email.com', phone: '503-555-1001', status: 'attending', count: 2 },
      { deceased: 'Margaret Thompson', service: 'Memorial Service', guest: 'James Reed', email: 'jreed@email.com', phone: '503-555-1002', status: 'attending', count: 3 },
      { deceased: 'Margaret Thompson', service: 'Memorial Service', guest: 'Linda Morrison', email: 'lmorrison@email.com', phone: '503-555-1003', status: 'attending', count: 1 },
      { deceased: 'Margaret Thompson', service: 'Memorial Service', guest: 'David Kim', email: 'dkim@email.com', phone: '503-555-1004', status: 'pending', count: 2 },
      { deceased: 'Margaret Thompson', service: 'Memorial Service', guest: 'Nancy White', email: 'nwhite@email.com', phone: '503-555-1005', status: 'declined', count: 0 },
      { deceased: 'Margaret Thompson', service: 'Reception', guest: 'Tom & Beth Anderson', email: 'tanderson@email.com', phone: '503-555-1006', status: 'attending', count: 2 },
    ];
    for (const r of rsvpList) {
      await pool.query(
        'INSERT INTO rsvp_entries (user_id, deceased_name, service_name, guest_name, email, phone, rsvp_status, guests_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [userId, r.deceased, r.service, r.guest, r.email, r.phone, r.status, r.count]
      );
    }
    console.log('Seeded 6 RSVP entries');

    // Seed Documents
    const docList = [
      { deceased: 'Margaret Thompson', title: 'Death Certificate', type: 'Death Certificate', ref: 'DC-2024-110234', description: 'Official death certificate from Multnomah County' },
      { deceased: 'Margaret Thompson', title: 'Last Will and Testament', type: 'Will', ref: 'WILL-MT-2020', description: 'Last will dated March 2020, held by Attorney Blake' },
      { deceased: 'Margaret Thompson', title: 'Life Insurance Policy', type: 'Insurance Policy', ref: 'POL-555-2024', description: 'MetLife policy, beneficiary: John Thompson' },
      { deceased: 'Margaret Thompson', title: 'Social Security Card', type: 'Photo ID', ref: 'SSN-file', description: 'Copy of Social Security card for estate processing' },
      { deceased: 'Robert Wilson', title: 'DD-214 Military Discharge', type: 'Legal Document', ref: 'DD214-RW-1968', description: 'Honorable discharge papers from U.S. Army' },
    ];
    for (const d of docList) {
      await pool.query(
        'INSERT INTO documents (user_id, deceased_name, title, document_type, file_reference, description) VALUES ($1,$2,$3,$4,$5,$6)',
        [userId, d.deceased, d.title, d.type, d.ref, d.description]
      );
    }
    console.log('Seeded 5 documents');

    // Seed Flower & Gifts
    const flowerList = [
      { deceased: 'Margaret Thompson', sender: 'Portland Teachers Union', type: 'Memorial Wreath', description: 'Large white and pink memorial wreath', date: '2024-11-05', thanks: true },
      { deceased: 'Margaret Thompson', sender: 'The Reed Family', type: 'Flowers', description: 'Arrangement of white lilies and roses', date: '2024-11-06', thanks: true },
      { deceased: 'Margaret Thompson', sender: 'Neighbor Association', type: 'Fruit Basket', description: 'Large fruit and gourmet food basket', date: '2024-11-06', thanks: false },
      { deceased: 'Margaret Thompson', sender: 'Lincoln Elementary Staff', type: 'Plant', description: 'Peace lily plant with memorial ribbon', date: '2024-11-07', thanks: false },
      { deceased: 'Robert Wilson', sender: 'VFW Post 1234', type: 'Memorial Wreath', description: 'Red, white, and blue patriotic wreath', date: '2024-10-17', thanks: true },
    ];
    for (const f of flowerList) {
      await pool.query(
        'INSERT INTO flower_gifts (user_id, deceased_name, sender_name, item_type, description, received_date, thank_you_sent) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, f.deceased, f.sender, f.type, f.description, f.date, f.thanks]
      );
    }
    console.log('Seeded 5 flower/gift entries');

    // Seed Announcements
    const announcementList = [
      { deceased: 'Margaret Thompson', title: 'Death Notice - Margaret Eleanor Thompson', content: 'It is with heavy hearts that we announce the passing of Margaret Eleanor Thompson, 89, of Portland, Oregon, on November 2, 2024. Margaret was a beloved mother, grandmother, and retired schoolteacher.', type: 'Death Notice', date: '2024-11-03', status: 'published' },
      { deceased: 'Margaret Thompson', title: 'Memorial Service Announcement', content: 'A celebration of life for Margaret Eleanor Thompson will be held at Grace Community Church on November 8, 2024, at 10:00 AM. A reception will follow at the Portland Garden Club. In lieu of flowers, donations may be made to the Lincoln Elementary School Library Fund.', type: 'Memorial Service', date: '2024-11-04', status: 'published' },
      { deceased: 'Robert Wilson', title: 'Funeral Service - Robert James Wilson', content: 'Military funeral honors for Robert James Wilson, 82, will be held at National Cemetery on October 20, 2024, at 11:00 AM. Full military honors will be rendered.', type: 'Funeral Announcement', date: '2024-10-16', status: 'published' },
    ];
    for (const a of announcementList) {
      await pool.query(
        'INSERT INTO announcements (user_id, deceased_name, title, content, announcement_type, publish_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [userId, a.deceased, a.title, a.content, a.type, a.date, a.status]
      );
    }
    console.log('Seeded 3 announcements');

    // Seed Travel & Accommodations
    const travelList = [
      { deceased: 'Margaret Thompson', guest: 'Sarah Thompson-Lee', arrival: '2024-11-06', departure: '2024-11-10', hotel: 'Hotel deLuxe', address: '729 SW 15th Ave, Portland, OR', transport: 'Flying from San Francisco, rental car reserved', status: 'confirmed' },
      { deceased: 'Margaret Thompson', guest: 'Michael Thompson', arrival: '2024-11-07', departure: '2024-11-09', hotel: 'Staying with John Thompson', address: '45 Pine Road, Portland, OR', transport: 'Driving from Seattle', status: 'confirmed' },
      { deceased: 'Margaret Thompson', guest: 'Uncle Robert & Aunt June', arrival: '2024-11-07', departure: '2024-11-11', hotel: 'Embassy Suites Portland', address: '319 SW Pine St, Portland, OR', transport: 'Flying from Denver, need airport pickup', status: 'pending' },
    ];
    for (const t of travelList) {
      await pool.query(
        'INSERT INTO travel_accommodations (user_id, deceased_name, guest_name, arrival_date, departure_date, accommodation_name, accommodation_address, transport_notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [userId, t.deceased, t.guest, t.arrival, t.departure, t.hotel, t.address, t.transport, t.status]
      );
    }
    console.log('Seeded 3 travel accommodations');

    // Seed Memorial Videos
    const videoList = [
      { deceased: 'Margaret Thompson', title: 'A Life Well Lived - Margaret Thompson', description: 'A memorial slideshow celebrating Margaret\'s 89 years of love, teaching, and family.', slides: 'Slide 1: Baby photo - Born March 15, 1935\nSlide 2: Graduation photo - University of Oregon, 1957\nSlide 3: Wedding photo - Harold & Margaret, 1959\nSlide 4: Teaching photo - First day at Lincoln Elementary\nSlide 5: Family group photo - Thompson family reunion, 1985\nSlide 6: Award ceremony - Teacher of the Year\nSlide 7: Retirement celebration, 2000\nSlide 8: Grandchildren montage\nSlide 9: Garden photos\nSlide 10: Final family photo, Christmas 2023', duration: '8 minutes', music: 'What a Wonderful World - Louis Armstrong', status: 'in_progress' },
      { deceased: 'Robert Wilson', title: 'Honoring Robert Wilson - A Hero\'s Journey', description: 'A tribute video honoring Robert\'s military service and architectural legacy.', slides: 'Slide 1: Childhood in Chicago\nSlide 2: Army enlistment photo\nSlide 3: Vietnam service photos\nSlide 4: Architecture school graduation\nSlide 5: First building design\nSlide 6: Wedding to Patricia\nSlide 7: Wilson Tower opening\nSlide 8: Family photos through the years', duration: '6 minutes', music: 'My Way - Frank Sinatra', status: 'planning' },
    ];
    for (const v of videoList) {
      await pool.query(
        'INSERT INTO memorial_videos (user_id, deceased_name, title, description, slides_content, duration, music_track, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [userId, v.deceased, v.title, v.description, v.slides, v.duration, v.music, v.status]
      );
    }
    console.log('Seeded 2 memorial videos');

    console.log('\n=== Seeding Complete ===');
    console.log('Login: admin@memorial.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
