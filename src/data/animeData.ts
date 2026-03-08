export interface AnimeTitle {
  id: string;
  title: string;
  japaneseTitle: string;
  type: "anime" | "manga";
  genres: string[];
  rating: number;
  episodes?: number;
  chapters?: number;
  status: string;
  synopsis: string;
  coverImage: string;
  year: number;
  studio?: string;
  author?: string;
}

export interface Review {
  id: string;
  animeId: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export const animeData: AnimeTitle[] = [
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    japaneseTitle: "進撃の巨人",
    type: "anime",
    genres: ["Action", "Drama", "Fantasy"],
    rating: 9.1,
    episodes: 87,
    status: "Completed",
    synopsis: "In a world where humanity lives within enormous walled cities to protect themselves from gigantic humanoid creatures known as Titans, young Eren Yeager vows to destroy them all after a Titan brings about the destruction of his hometown and the death of his mother.",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    year: 2013,
    studio: "WIT Studio / MAPPA",
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    japaneseTitle: "鬼滅の刃",
    type: "anime",
    genres: ["Action", "Supernatural", "Historical"],
    rating: 8.9,
    episodes: 55,
    status: "Airing",
    synopsis: "A young boy named Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his younger sister Nezuko is turned into a demon. He embarks on a journey to find a cure for her and avenge his family.",
    coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    year: 2019,
    studio: "ufotable",
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    japaneseTitle: "呪術廻戦",
    type: "anime",
    genres: ["Action", "Supernatural", "School"],
    rating: 8.7,
    episodes: 47,
    status: "Airing",
    synopsis: "Yuji Itadori, a high school student, joins a secret organization of Jujutsu Sorcerers to kill a powerful Curse named Ryomen Sukuna, of whom Yuji becomes the host after swallowing one of his fingers.",
    coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    year: 2020,
    studio: "MAPPA",
  },
  {
    id: "one-piece-manga",
    title: "One Piece",
    japaneseTitle: "ワンピース",
    type: "manga",
    genres: ["Adventure", "Comedy", "Fantasy"],
    rating: 9.2,
    chapters: 1100,
    status: "Ongoing",
    synopsis: "Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever, known as 'One Piece', in order to become the next King of the Pirates.",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/253146l.jpg",
    year: 1997,
    author: "Eiichiro Oda",
  },
  {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    japaneseTitle: "チェンソーマン",
    type: "manga",
    genres: ["Action", "Horror", "Supernatural"],
    rating: 8.8,
    chapters: 170,
    status: "Ongoing",
    synopsis: "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil corpses.",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/216464l.jpg",
    year: 2018,
    author: "Tatsuki Fujimoto",
  },
  {
    id: "spy-x-family",
    title: "Spy x Family",
    japaneseTitle: "スパイファミリー",
    type: "anime",
    genres: ["Action", "Comedy", "Slice of Life"],
    rating: 8.6,
    episodes: 37,
    status: "Airing",
    synopsis: "A spy known as 'Twilight' is tasked with building a family to execute a mission, not realizing that the girl he adopts as his daughter is a telepath, and the woman he agrees to be in a fake marriage with is a skilled assassin.",
    coverImage: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    year: 2022,
    studio: "WIT Studio / CloverWorks",
  },
  {
    id: "vinland-saga",
    title: "Vinland Saga",
    japaneseTitle: "ヴィンランド・サガ",
    type: "anime",
    genres: ["Action", "Adventure", "Drama"],
    rating: 8.8,
    episodes: 48,
    status: "Completed",
    synopsis: "Thorfinn, son of one of the Vikings' greatest warriors, is among the finest fighters in the merry band of mercenaries run by the man who killed his father. He lives to challenge that man to a duel and avenge his father.",
    coverImage: "https://cdn.myanimelist.net/images/anime/1500/103005l.jpg",
    year: 2019,
    studio: "WIT Studio / MAPPA",
  },
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    japaneseTitle: "俺だけレベルアップな件",
    type: "manga",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 8.5,
    chapters: 200,
    status: "Completed",
    synopsis: "In a world where hunters — human warriors who possess supernatural abilities — must battle deadly monsters to protect the human race, Sung Jinwoo, the weakest hunter, discovers a hidden dungeon that grants him the power to level up endlessly.",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/222295l.jpg",
    year: 2018,
    author: "Chugong",
  },
];

export const reviewsData: Review[] = [
  { id: "r1", animeId: "attack-on-titan", userName: "SakuraDreamer", avatar: "🌸", rating: 10, comment: "An absolute masterpiece. The storytelling, the animation, the music — everything comes together perfectly. The final season left me speechless.", date: "2024-12-15", likes: 234 },
  { id: "r2", animeId: "attack-on-titan", userName: "TitanFan99", avatar: "⚔️", rating: 9, comment: "One of the best anime ever made. The plot twists are incredible and keep you guessing until the very end.", date: "2024-11-20", likes: 189 },
  { id: "r3", animeId: "attack-on-titan", userName: "AnimeConnoisseur", avatar: "🎭", rating: 8, comment: "Great series overall, though the pacing in some middle episodes could be better. The action sequences are top-tier.", date: "2024-10-05", likes: 67 },
  { id: "r4", animeId: "demon-slayer", userName: "NezukoLover", avatar: "🦋", rating: 10, comment: "The animation quality by ufotable is simply breathtaking. Every fight scene is a visual feast!", date: "2024-12-01", likes: 312 },
  { id: "r5", animeId: "demon-slayer", userName: "SwordMaster", avatar: "🗡️", rating: 8, comment: "Beautiful animation carries a somewhat simple story. Still very enjoyable and emotional.", date: "2024-11-10", likes: 98 },
  { id: "r6", animeId: "jujutsu-kaisen", userName: "CursedEnergy", avatar: "👁️", rating: 9, comment: "MAPPA outdid themselves with the action choreography. Gojo Satoru is the coolest character in anime.", date: "2024-12-20", likes: 445 },
  { id: "r7", animeId: "one-piece-manga", userName: "StrawHatCrew", avatar: "🏴‍☠️", rating: 10, comment: "27 years of storytelling excellence. Oda is a genius. The Wano arc was absolutely phenomenal.", date: "2024-12-18", likes: 567 },
  { id: "r8", animeId: "chainsaw-man", userName: "DevilHunter", avatar: "🔥", rating: 9, comment: "Fujimoto's writing is unlike anything else in manga. Raw, emotional, and completely unpredictable.", date: "2024-11-25", likes: 203 },
];

export const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life", "Supernatural", "Historical", "School"];
