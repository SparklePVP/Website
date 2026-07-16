CREATE TABLE IF NOT EXISTS terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT NOT NULL,
  pron TEXT,
  pos TEXT DEFAULT 'noun',
  def TEXT NOT NULL,
  example TEXT,
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
);

INSERT INTO terms (term, pron, pos, def, example) VALUES
('Gigged', '/gigged/', 'noun', 'Something happened to you or others.', 'Your Gigged!'),
('Civii', '/ˈsɪv.i.i/', 'proper noun', 'Place of origin.', 'Pull up Civii.'),
('Turban', '/tur-ban/', 'noun', 'Amaan.', 'Amaan wears a blue Turban.'),
('PPSS', '/ppss/', 'abbreviation', 'PPSS.', 'PPSS'),
('GPC', '/g-p-c/', 'abbreviation', 'Game Play Cuck.', 'I will GPC.'),
('GP', '/g-p/', 'abbreviation', 'Gameplay — obviously not any other meaning ;)', 'Hop GP.'),
('YCIC', '/y-c-i-c/', 'abbreviation', 'Condition: someone else has to buy a game first.', 'You cop I cop.'),
('LC', '/l-c/', 'abbreviation', 'Last Chance.', 'LC for GP.'),
('Powerhungry', '/power-hung-ry/', 'noun', 'Those who have power.', NULL),
('Powerhung', '/power-hung/', 'noun', 'Those who don''t have power.', NULL),
('Those Who Know', '/those-who-know/', 'phrase', 'You know something others do not.', 'Those who know.'),
('5 Min Chart', '/5-min-chart/', 'phrase', 'Need to be right back.', 'Those who know 5 min.'),
('Sneaky Link', '/sneaky-link/', 'noun', 'Act of meeting up IRL.', 'Let''s sneaky link.'),
('Zac no D*ck', '/zac-no-dck/', 'noun', 'The incident.', NULL),
('Beaming', '/beam-ing/', 'verb', 'When you start to do consistent damage to your enemy.', 'I''m Beaming.'),
('A Man of Few Words', '/a-man-of-few-words/', 'phrase', 'Phrase used by Amaan.', 'A man of few words.'),
('Hop On', '/hop-on/', 'phrase', 'Asking homies to hop in call / hop on a GP.', 'Hop on GP.'),
('Juanito', '/wan-ee-toh/', 'noun', 'Term used when dealing with Spanish-speaking players in a GP.', 'Damn Juanito''s and their controllers.'),
('SS', '/s-s/', 'abbreviation', 'Any abbreviation of SS leads to Wang.', 'It''s SS!!!!'),
('Wang', '/wang/', 'noun', 'Wang.', 'What''s Wang up to!'),
('Just Saying', '/just-say-ing/', 'phrase', 'When you need to use a verbal shield.', 'Just Saying.'),
('Gtnotgrn', '/g-t-n-o-t-g-r-n/', 'abbreviation', 'Get this neighbour out the game right now.', 'Gtnotgrn');
