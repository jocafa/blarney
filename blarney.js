(function() {
  // random number generator from http://baagoe.org/en/wiki/Better_random_numbers_for_javascript
  var DATA;

  function hash (data) {
    var h, i, n;

    n = 0xefc8249d;

    data = data.toString();

    for (i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  }

  // private random helper
  function rnd () {
    var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

    this.c = t | 0;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.s2 = t - this.c;
    return this.s2;
  }

  function Blarney () {
    this.sow.apply(this, arguments);
  }

  Blarney.prototype.sow = function () {
    var i, seeds, seed;

    this.s0 = hash(' ');
    this.s1 = hash(this.s0);
    this.s2 = hash(this.s1);
    this.c = 1;

    seeds = Array.prototype.slice.call(arguments);

    // the funky `for` syntax is intentional
    for (i = 0; seed = seeds[i++];) {
      this.s0 -= hash(seed);
      this.s0 += ~~(this.s0 < 0);

      this.s1 -= hash(seed);
      this.s1 += ~~(this.s1 < 0);

      this.s2 -= hash(seed);
      this.s2 += ~~(this.s2 < 0);
    }
  };


  Blarney.prototype.uint32 = function () {
    return rnd.apply(this) * 0x100000000; // 2^32
  };

  Blarney.prototype.fract32 = function () {
    return rnd.apply(this) + (rnd.apply(this) * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };

  Blarney.prototype.bool = function () {
    return this.uint32() & 0x1 ? true : false;
  };

  Blarney.prototype.integer = function() {
    return this.uint32();
  };

  Blarney.prototype.frac = function() {
    return this.fract32();
  };

  Blarney.prototype.real = function() {
    return this.uint32() + this.fract32();
  };

  Blarney.prototype.integerInRange = function(min, max) {
    return Math.floor(this.realInRange(min, max));
  };

  Blarney.prototype.realInRange = function(min, max) {
    min = min || 0;
    max = max || 0;
    return this.frac() * (max - min) + min;
  };

  Blarney.prototype.normal = function() {
    return 1 - 2 * this.frac();
  };

  Blarney.prototype.uuid = function() {
    // from https://gist.github.com/1308368
    var a, b;
    for (
      b=a='';
      a++<36;
      b+=~a%5|a*3&4?(a^15?8^this.frac()*(a^20?16:4):4).toString(16):'-'
    );
    return b;
  };

  Blarney.prototype.pick = function(ary) {
    return ary[this.integerInRange(0, ary.length)];
  };

  Blarney.prototype.weightedPick = function(ary) {
    return ary[~~(Math.pow(this.frac(), 2) * ary.length)];
  };

  // Language  ----------------------------------------------------------------
  Blarney.prototype.word = function() {
    return this.pick(DATA.lipsum);
  };

  Blarney.prototype.words = function(num) {
    num = num || 3;
    var ret = [];
    for (var i = 0; i < num; i++) {
      ret.push(this.pick(DATA.lipsum));
    }
    return ret.join(' ');
  };

  Blarney.prototype.sentence = function() {
    var ret;
    ret = this.words(this.integerInRange(2, 16)).replace(/[a-z]/, function(m) {
      return m.toUpperCase();
    });
    return ret + '.';
  };

  Blarney.prototype.sentences = function(num) {
    num = num || 3;
    var ret = [];
    for (var i = 0; i < num; i++) {
      ret.push(this.sentence());
    }
    return ret.join(' ');
  };

  // Time  --------------------------------------------------------------------
  Blarney.prototype.timestamp = function(a, b) {
    return this.realInRange(a || 946684800000, b || 1577862000000);
  };

  // People  ------------------------------------------------------------------
  Blarney.prototype.gender = function () {
    return this.bool() ? 'male' : 'female';
  };

  Blarney.prototype.firstName = function(gender) {
    gender = gender || this.gender();
    return "" + (this.pick(DATA.names.first[gender]));
  };

  Blarney.prototype.lastName = function() {
    return "" + (this.pick(DATA.names.last));
  };

  Blarney.prototype.name = function(gender) {
    return "" + (this.firstName(gender)) + " " + (this.lastName());
  };

  Blarney.prototype.jobTitle = function() {
    return "" + (this.pick(DATA.departments)) + " " + (this.pick(DATA.positions));
  };

  Blarney.prototype.portrait = function (gender) {
    gender = gender || this.gender();
    var
      urlroot = 'https://flic.kr/p/img/',
      shortid = this.pick(DATA.portraits[gender]),
      urlpartial = urlroot + shortid;

    return {
      smallSquare: urlpartial + '_s.jpg',
      largeSquare: urlpartial + '_q.jpg',
      thumbnail: urlpartial + '_m.jpg',
      small: urlpartial + '_n.jpg'
    };
  };

  // Business ------------------------------------------------------------

  Blarney.prototype.buzzPhrase = function() {
    return "" + (this.pick(DATA.buzz.verbs)) + " " + (this.pick(DATA.buzz.adjectives)) + " " + (this.pick(DATA.buzz.nouns));
  };

  // Internet  ------------------------------------------------------------------
  Blarney.prototype.domain = function() {
    return "" + (this.word()) + (this.pick(DATA.internet.tlds));
  };

  Blarney.prototype.email = function() {
    return "" + (this.name().replace(/\s/g, ".").toLowerCase()) + "@" + (this.domain());
  };

  // Dataset  -----------------------------------------------------------------
  DATA = {
    lipsum: [
      "lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
      "adipiscing", "elit", "nunc", "sagittis", "tortor", "ac", "mi",
      "pretium", "sed", "convallis", "massa", "pulvinar", "curabitur",
      "non", "turpis", "velit", "vitae", "rutrum", "odio", "aliquam",
      "sapien", "orci", "tempor", "sed", "elementum", "sit", "amet",
      "tincidunt", "sed", "risus", "etiam", "nec", "lacus", "id", "ante",
      "hendrerit", "malesuada", "donec", "porttitor", "magna", "eget",
      "libero", "pharetra", "sollicitudin", "aliquam", "mattis", "mattis",
      "massa", "et", "porta", "morbi", "vitae", "magna", "augue",
      "vestibulum", "at", "lectus", "sed", "tellus", "facilisis",
      "tincidunt", "suspendisse", "eros", "magna", "consequat", "at",
      "sollicitudin", "ac", "vestibulum", "vel", "dolor", "in", "egestas",
      "lacus", "quis", "lacus", "placerat", "et", "molestie", "ipsum",
      "scelerisque", "nullam", "sit", "amet", "tortor", "dui", "aenean",
      "pulvinar", "odio", "nec", "placerat", "fringilla", "neque", "dolor"
    ],

    names: {
      first: {
        // Top names from 1913-2012
        // Data from http://www.ssa.gov/OACT/babynames/decades/century.html
        // Ranked by popularity
        male: [
          "James", "John", "Robert", "Michael", "William", "David", "Richard",
          "Joseph", "Charles", "Thomas", "Christopher", "Daniel", "Matthew",
          "Donald", "Anthony", "Paul", "Mark", "George", "Steven", "Kenneth",
          "Andrew", "Edward", "Brian", "Joshua", "Kevin", "Ronald", "Timothy",
          "Jason", "Jeffrey", "Gary", "Ryan", "Nicholas", "Eric", "Stephen",
          "Jacob", "Larry", "Frank", "Jonathan", "Scott", "Justin", "Raymond",
          "Brandon", "Gregory", "Samuel", "Patrick", "Benjamin", "Jack",
          "Dennis", "Jerry", "Alexander", "Tyler", "Douglas", "Henry", "Peter",
          "Walter", "Aaron", "Jose", "Adam", "Harold", "Zachary", "Nathan",
          "Carl", "Kyle", "Arthur", "Gerald", "Lawrence", "Roger", "Albert",
          "Keith", "Jeremy", "Terry", "Joe", "Sean", "Willie", "Jesse",
          "Ralph", "Billy", "Austin", "Bruce", "Christian", "Roy", "Bryan",
          "Eugene", "Louis", "Harry", "Wayne", "Ethan", "Jordan", "Russell",
          "Alan", "Philip", "Randy", "Juan", "Howard", "Vincent", "Bobby",
          "Dylan", "Johnny", "Phillip", "Craig"
        ],

        female: [
          "Mary", "Patricia", "Elizabeth", "Jennifer", "Linda", "Barbara",
          "Susan", "Margaret", "Jessica", "Dorothy", "Sarah", "Karen", "Nancy",
          "Betty", "Lisa", "Sandra", "Helen", "Donna", "Ashley", "Kimberly",
          "Carol", "Michelle", "Amanda", "Emily", "Melissa", "Laura", "Deborah",
          "Stephanie", "Rebecca", "Sharon", "Cynthia", "Ruth", "Kathleen",
          "Anna", "Shirley", "Amy", "Angela", "Virginia", "Brenda", "Pamela",
          "Catherine", "Katherine", "Nicole", "Christine", "Janet", "Debra",
          "Carolyn", "Samantha", "Rachel", "Heather", "Maria", "Diane",
          "Frances", "Joyce", "Julie", "Martha", "Joan", "Evelyn", "Kelly",
          "Christina", "Emma", "Lauren", "Alice", "Judith", "Marie", "Doris",
          "Ann", "Jean", "Victoria", "Cheryl", "Megan", "Kathryn", "Andrea",
          "Jacqueline", "Gloria", "Teresa", "Janice", "Sara", "Rose", "Julia",
          "Hannah", "Theresa", "Judy", "Mildred", "Grace", "Beverly", "Denise",
          "Marilyn", "Amber", "Danielle", "Brittany", "Diana", "Jane", "Lori",
          "Olivia", "Tiffany", "Kathy", "Tammy", "Crystal", "Madison"
        ]
      },

      last: [
        "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis",
        "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas",
        "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia",
        "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
        "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
        "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
        "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts",
        "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards",
        "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed",
        "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera",
        "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres",
        "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks",
        "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes",
        "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell",
        "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler",
        "Simmons", "Foster", "Gonzales", "Bryant", "Alexander",
        "Russell", "Griffin", "Diaz", "Hayes"
      ]
    },

    departments: ['HR', 'IT', 'Marketing', 'Engineering', 'Sales'],

    positions: ['Director', 'Manager', 'Team Lead', 'Team Member'],

    internet: {
      tlds: ['.com', '.net', '.org', '.edu', '.co.uk']
    },

    buzz: {
      nouns: [
        "action-items", "applications", "architectures", "bandwidth",
        "channels", "communities", "content", "convergence",
        "deliverables", "e-business", "e-commerce", "e-markets",
        "e-services", "e-tailers", "experiences", "eyeballs",
        "functionalities", "infomediaries", "infrastructures",
        "initiatives", "interfaces", "markets", "methodologies",
        "metrics", "mindshare", "models", "networks", "niches",
        "paradigms", "partnerships", "platforms", "portals",
        "relationships", "ROI", "schemas", "solutions", "supply-chains",
        "synergies", "systems", "technologies", "users", "vortals",
        "web services", "web-readiness"
      ],

      adjectives: [
        "24/365", "24/7", "B2B", "B2C", "back-end", "best-of-breed",
        "bleeding-edge", "bricks-and-clicks", "clicks-and-mortar",
        "collaborative", "compelling", "cross-media", "cross-platform",
        "customized", "cutting-edge", "distributed", "dot-com",
        "dynamic", "e-business", "efficient", "end-to-end",
        "enterprise", "extensible", "frictionless", "front-end",
        "global", "granular", "holistic", "impactful", "innovative",
        "integrated", "interactive", "intuitive", "killer",
        "leading-edge", "magnetic", "mission-critical", "multiplatform",
        "next-generation", "one-to-one", "open-source",
        "out-of-the-box", "plug-and-play", "proactive", "real-time",
        "revolutionary", "rich", "robust", "scalable", "seamless",
        "sexy", "sticky", "strategic", "synergistic", "transparent",
        "turn-key", "ubiquitous", "user-centric", "value-added",
        "vertical", "viral", "virtual", "visionary", "web-enabled",
        "wireless", "world-class"
      ],

      verbs: [
        "aggregate", "architect", "benchmark", "brand", "cultivate",
        "deliver", "deploy", "disintermediate", "drive", "e-enable",
        "embrace", "empower", "enable", "engage", "engineer", "enhance",
        "envisioneer", "evolve", "expedite", "exploit", "extend",
        "facilitate", "generate", "grow", "harness", "implement",
        "incentivize", "incubate", "innovate", "integrate", "iterate",
        "leverage", "matrix", "maximize", "mesh", "monetize", "morph",
        "optimize", "orchestrate", "productize", "recontextualize",
        "redefine", "reintermediate", "reinvent", "repurpose",
        "revolutionize", "scale", "seize", "strategize", "streamline",
        "syndicate", "synergize", "synthesize", "target", "transform",
        "transition", "unleash", "utilize", "visualize", "whiteboard"
      ]
    },

    // All portrait data comes from GregPC's "1000faces1" photo set.
    // http://www.flickr.com/photos/gregpc/sets/72157606694597353/
    // Huge thanks to him!
    portraits: {
      male: [
        "6pMG86", "6pMFTi", "6pRQqs", "6pRQbE", "6pMFor", "6pRPTU", "6pMFaF",
        "6pMGRB", "6pRRhW", "6pRR2G", "6pMFcK", "6pG9w7", "6oiCVw", "6oiCZQ",
        "6oes3c", "6oiDoS", "6oesvg", "6oessR", "6oiCEw", "6oiCSN", "6oes5X",
        "6oiDau", "6oesp6", "6oeszZ", "6oiDFW", "6oiDeE", "6o3qVR", "6o3qGP",
        "6m96T2", "6mdfWS", "6m96Fn", "6m96CM", "6m96xg", "6m96tF", "6m96ra",
        "6m96ft", "6mdfib", "6m966B", "6jdWc8", "6jdW5X", "6jdW4D", "6ji7ij",
        "6jdW1D", "6jdVW6", "6jdVUi", "6ji75m", "6jdXXv", "6j5ydN", "6j1jJM",
        "6j5v8A", "6j1jBK", "6j5mwj", "6j1b7X", "6j1b4R", "6j5mhG", "6j1aRH",
        "6j5m27", "6hNHSd", "6hJtpH", "6fFTn7", "6fqMFp", "6fuY8C", "6fqKXP",
        "6fuWkS", "6fqKJD", "6fqCjB", "6fqCgT", "6fuNwS", "6fuNsw", "6fqHSP",
        "6c7oah", "6c3eUZ", "6c3eSR", "6c3ePB", "6c7nZ5", "6c7nVm", "6c7nJN",
        "6bkPAL", "6bkPy7", "6bkPvb", "6bkPtj", "68C6fk", "68Gjib", "68Gj6f",
        "67GNLU", "67CBBz", "675NAT", "67a2uA", "67a2rd", "675Nva", "675Nrt",
        "675Nda", "675Nap", "66Fgu2", "66KxXj", "66Fgnr", "66FgkD", "66FgfF",
        "65zTNS", "65zTLE", "65zTJ3", "64i3ip", "64naTN", "63S9H3", "63MVqX",
        "63S9wd", "63MV9v", "63MUZZ", "63MUVk", "63S92o", "63MUFt", "64F33R",
        "64F312", "63G2gA", "63BLEt", "62pXth", "62kDDB", "624pvg", "624ptr",
        "624pqp", "624pjz", "624pgZ", "624p9i", "624p82", "628Cky", "5ZzL8S",
        "5ZzKVj", "5Zvy6a", "5ZzKpd", "5ZzK4u", "5ZtvRi", "5ZxGYq", "5ZtugV",
        "5Ztsce", "5ZtrnH", "5ZxCch", "5ZmA7q", "5ZhoNT", "5ZmzZW", "5YrkHb",
        "5Yn6XB", "5YrktL", "5Yn6Qg", "5XD1yZ", "5XHgvs", "5XD1ug", "5XD1q2",
        "5XD1oD", "5XD1n8", "5X1mre", "5Wj6dj", "5WeNb2", "5WeN8B", "5VZxvn",
        "5VHTRF", "5VHU5K", "5VHU3e", "5VNfhm", "5VHTLp", "5VNeUw", "5UJWpx",
        "5UPj5f", "5UPiYf", "5UPiVG", "5UjuyK", "5UoRCA", "5UoRwQ", "5Ujukn",
        "5Ujugv", "5Ujudp", "5SQF1N", "5QVqEz", "5QVqyV", "5QVqtp", "5QZGW1",
        "5QZGR1", "5QJvGQ", "5PRGvq", "5PMrj2", "5PRGaL", "5PMqU8", "5PgHFa",
        "5PgHB4", "5PkZBf", "5PkZxh", "5MN1Nc", "5MSfbU", "5MSf8C", "5MSeSC",
        "5MN1ja", "5MN164", "5MD793", "5MoxwQ", "5Lo6Vk", "5Lo6SR", "5KyPk9",
        "5Jjodx", "5JoDwq", "5JbPNW", "5J6sgU", "5HGpfi", "5HLGLq", "5GqzQU",
        "5Gqzz5", "5Gmhe2", "5Gqz3A", "5Fn3hV", "5Fn3fc", "5Fn2Wa", "5EKtco",
        "5Doazz", "5DsthG", "5DoasF", "5DoaoH", "5DoamM", "5DoajK", "5Dst59",
        "5Dst1m", "5CE2HX", "5BHpJt", "5BHpGT", "5BMFHE", "5BHpyK", "5A1SMX",
        "5A6aub", "5A1SCR", "5A6am5", "5yMc4g", "5xWsPS", "5xS5sa", "5xS5qt",
        "5xS5on", "5xdc38", "5wMyTg", "5wMyQt", "5waxmk", "5waxdg", "5wax8V",
        "5wax1g", "5uVjgk", "5uVj9X", "5uVj6r", "5uy6HG", "5umTHg", "5umTvM",
        "5urhS1", "5umTiP", "5urhEL", "5ufYSm", "5ttFEJ", "5tphCn", "5ttEUE",
        "5ttENj", "5sDwvN", "5sDwoG", "5sDwjU", "5sz9Ne", "5sDweJ", "5sDwaJ",
        "5sz9Fc", "5sDw5L", "5sDw47", "5sDw2h", "5rpQt3", "5rpQqA", "5rpQkN",
        "5rkugX", "5rkudz", "5rpQ8m", "5rku46", "5rpPZL", "5qR5bM", "5qVpsN",
        "5pVGxR", "5psHQf", "5psHL7", "5porHH", "5psHCN", "5psHyQ", "5npwaB",
        "5npvnZ", "5mUeRX", "5mUePM", "5mUeJk", "5mUeGX", "5mYuJ3", "5mUeBK",
        "5mUeyz", "5mUewF", "5mUeuB", "5mUerP", "5mYuwj", "5mYuuU", "5mUenF",
        "5mCeJV", "5mGu4L", "5kSasg", "5kWqam", "5kWpKU", "5kS6dr", "5kWiLq",
        "5kWhKS", "5kWhoL", "5kWeqY", "5kRXz4", "5kRWZX", "5j8xuG", "5j8xaW",
        "5j8x43", "5iUx4L", "5iUwVG", "5iUwRS", "5iQf1r", "5iQeU8", "5iQeSz",
        "5iQeNT", "5gYoxJ", "5gU2wr", "5gYoqj", "5gYop3", "5gYonG", "5gU2k2",
        "5gU2cz", "5dooLE", "5dj4mr", "5dooH1", "5dooFm", "5dooD9", "5dj4cM",
        "5dooz9", "5doowL", "5dj46e", "5dootG", "5doorC", "5dj3ZF", "5doonN",
        "5dj3Tt", "5dj3RB", "5doob1", "5cFSjv", "5cGYMo", "5cCGSi", "5cCGNg",
        "5cGYzE", "5cCGEM", "5cGYsq", "5cCGx6", "5cGYmq", "5cCGqP", "5cCGnR",
        "5cCGj2", "5cGY8u", "5cGY5b", "5brNRH", "5brNPV", "5bw6wU", "5bw6sE",
        "5bfSzB", "5bfL64", "5bk3UG", "5bk3rj", "5bk3md", "5bk355", "5bk31y",
        "5bk2yA", "5bkexq", "5bkeu7", "5bfWvk", "5bkem3", "5bkehd", "5bfWkR",
        "59j1M6", "59oeCA", "59j1kR", "59oenC", "59oe4h", "59odZU", "59odX7",
        "59iZQc", "59odKb", "59iZzz", "59odyh", "59odvN", "59odnd", "59odj5",
        "59iZ8M", "59iZ6a", "59oc9u", "59iY1z", "59iXYa", "59iXRD", "59obRL",
        "58goo8", "58kyYu", "58kyEN", "56z72K", "56z6VX", "56z6NK", "56Dgm3",
        "56Dgeh", "56EyaP", "56Ey3Z", "56ExUc", "56Exsn", "56kY2A", "56gLEr",
        "56kVys", "56gHPz", "56gFxB", "56gEin", "56kPnY", "56gBUR", "56kMbW",
        "56gzz6", "56kJPJ", "56gxkM", "56kGEs", "56kFuq", "56gu6v", "56kDwd",
        "56gscP", "56graK", "56gq7X", "56gp8n", "56go5M", "56gmXp", "56gkXe",
        "56gjV2", "56kujf", "56ghNF", "56ksc9", "56kr3b", "56gevK", "56koLo",
        "56knyu", "56kmtL", "56ga4B", "56g93p", "56g81K", "56khfJ", "56g62i",
        "56kfdN", "56keeQ", "56kdf7", "56g27g", "56kbg7", "56fZ34", "56fY4n",
        "56k8jU", "56fWbv", "56fVjX", "56fUs2", "56k4PS", "56k3Z3", "56k36d",
        "56k2bb", "56k1bb", "56jZh7", "56jYgJ", "56jXf9", "56jWhj", "56fK6v",
        "56fJb2", "56jTwJ", "56fGdX", "56jRwU", "56fEjV", "56jPwL", "56fChH",
        "56fBn8", "56fAr2", "56jJTY", "56jHQy", "56fwC8", "56jFYf", "56fuEg",
        "56ftGK", "56jCYu", "56jC3L", "56jB4Q", "56fpQV", "56jz4j", "56jy7Y",
        "56fmSc", "56fkVX", "56jvoN", "56fiUx", "56fh78", "56jrN3", "56jqTY",
        "56fepe", "56fdtg", "56jo6s", "56fbz4", "56jmhh", "56f9Kc", "56f8HT",
        "56jipN", "56jhth", "56f62F", "56jfBb", "56jeDA", "56f3bR", "56jcR3",
        "56f1jX", "56jb1U", "56eYs8", "56eXwx", "56j8py", "56eVRz", "56j6By",
        "56eU6x", "56eT9p", "56j3TG", "56eRpp", "56j28u", "56ePBr", "56iZnd",
        "56iYyh", "56eMet", "56eLqT", "56eKBP", "56eJMT", "56iUzu", "56eHac",
        "56eGkp", "56iS3G", "56eEDx", "56eDCF", "56iPj5", "56iNi1", "56iMpA",
        "56iLx5", "56iKHy", "56iJV5", "56iJ7L", "56evYi", "56ev8g", "56iFt5",
        "57d3p6", "56Xjmo", "56Xjds", "56Xj9G", "56Xj2b", "56XiWQ", "56T8Tn",
        "56XiFb", "56T8rv", "56T8mk", "4LvEAR", "4GrHuS", "4Ew6zX", "4EAmbm",
        "4CPMuv", "4CU1x3", "4C5QTk", "4zTkwV", "4xXyhp", "4wsZ9c", "4woFYY",
        "4p4zTi", "4p4zcF", "4p8DkE", "3cxFZ6", "3cxGfM", "3cxFGR"
      ],

      female:[
        "6pTeBn", "6pMGAg", "6pRR63", "6pMGnH", "6pMGgz", "6pMGda", "6pRQFo",
        "6pRQzJ", "6pMFKc", "6pMFGe", "6pMFyD", "6pRQ5b", "6pRPPQ", "6pMF7a",
        "6pMFs6", "6pRPAy", "6pMGXP", "6pRRrC", "6pMGNz", "6pMGDx", "6pMFDZ",
        "6oerP6", "6oebSB", "6oerWe", "6oiCLG", "6oerGx", "6oiDkN", "6oesfH",
        "6o3qYD", "6o7Bmd", "6o3qRB", "6o7BgJ", "6m96X6", "6mdfF9", "6m96nB",
        "6m96kg", "6m96ag", "6m9644", "6m961K", "6jdWeB", "6jdWar", "6jdW84",
        "6ji7eG", "6ji7dq", "6ji77Q", "6j5yi7", "6j5y9u", "6j5vnw", "6j1jM6",
        "6j5vaC", "6j5mn1", "6j5mj7", "6j5mas", "6j1aKV", "6j5kX1", "6hJyBP",
        "6hNCwY", "6hJtkD", "6hJqaH", "6hNzp5", "6hJq7z", "6hNzhf", "6gtjhs",
        "6fFTj7", "6fFT4w", "6fBGQx", "6fFSUd", "6fBGFT", "6fqKQ8", "6fuW6f",
        "6fuUkC", "6c3eEB", "6c3eCa", "6c3ezK", "6c3etR", "6c3era", "69gcBi",
        "68Gj9h", "68C5Vt", "67CBNH", "67CBEP", "67CBxF", "675NEk", "675ND8",
        "67a2xC", "67a2vw", "675NtV", "675Nt8", "675Nqe", "675Nnx", "675Nh6",
        "66Fgyn", "66Fgw4", "66Fgsg", "66KxV3", "66Fgj6", "66Fgh4", "66KxEE",
        "66Fg7D", "65zTTW", "65vBqD", "65zTQJ", "65hpDT", "65zTKq", "65vBdT",
        "64i3nn", "64ngWj", "64hWiM", "64naR1", "64hW9e", "64hW6p", "64naFQ",
        "64hVWR", "63MVyP", "63S9JL", "63MVt8", "63MVh2", "63S9sE", "63S9r7",
        "63S9oS", "63MV7B", "63S9i5", "63S9fS", "63MUXR", "63S961", "63MURX",
        "63S8ZA", "63MUKF", "63MUH8", "63MUDn", "64KjXU", "63BLLP", "63G2b1",
        "62kJ3z", "62pTcq", "628CQo", "624pxZ", "624poF", "628Ctj", "5ZzLBU",
        "5ZvyMT", "5ZzLnq", "5Zvywp", "5ZzL27", "5ZzKFq", "5ZvxPX", "5ZvxAp",
        "5ZzKbs", "5ZxAM7", "5ZmAhw", "5ZmAej", "5ZhoWk", "5ZhoEZ", "5ZhoBD",
        "5Zhoy2", "5ZhotT", "5ZmzDw", "5Yn7cz", "5Yn75v", "5Yrkjy", "5XHgE7",
        "5XHgzq", "5XHgr7", "5Wj65U", "5WeN3n", "5W4Sdm", "5VHTEn", "5VNffm",
        "5VHTXB", "5VHTVX", "5VHTU6", "5VHTPV", "5VHTN2", "5VHTHT", "5VHTFK",
        "5VHTBx", "5UPj2Q", "5UPiSj", "5UJW6X", "5UoRJW", "5UoRGu", "5UoRF3",
        "5Ujuq6", "5UjuoM", "5UoRmb", "5SQF4y", "5SLkwD", "5SQEUj", "5QZHaA",
        "5QZH4A", "5QZGYj", "5QVqm4", "5QJvJ5", "5QEe7p", "5PRGrG", "5PMrnH",
        "5PRGg5", "5PMr3D", "5PRG1E", "5PRFRN", "5PD1oG", "5PkZPJ", "5MN1S2",
        "5MSf5y", "5MN1v2", "5MSeXs", "5MSeLf", "5MN19T", "5MSewy", "5MD7d9",
        "5MD74Y", "5MoxQU", "5MjiNt", "5MjiGT", "5KyPr7", "5Kuz4P", "5KyPfQ",
        "5KuyZv", "5KyPc1", "5JjofP", "5Jjobe", "5Jjo6n", "5J7xXV", "5JbPRC",
        "5J7xGv", "5J2d7k", "5J2c8n", "5JbPAY", "5HGpbX", "5HLGNE", "5GqzGW",
        "5Gqzd9", "5Frkdf", "5Frk4f", "5FrjTE", "5Fn36B", "5FrjGG", "5EKooA",
        "5EF8f4", "5EKzES", "5FrrYq", "5Dvaoo", "5CE2Ut", "5BMFUw", "5BMFR1",
        "5BHpF2", "5BMFES", "5CJknd", "5CJkfj", "5AP6JQ", "5A1SH4", "5A6aqf",
        "5A6ahs", "5xWsG1", "5xWsD5", "5xS5hc", "5xS5ek", "5wRWvW", "5weSFm",
        "5weSw3", "5wax4e", "5weSb7", "5wawUR", "5vsUJS", "5uVjj4", "5uZFau",
        "5uy6KQ", "5umTEn", "5umTA2", "5urhMN", "5umTdi", "5urhz1", "5ufYV5",
        "5ufXBw", "5tphW8", "5ttFrS", "5ttF9d", "5ttF1A", "5tzzQH", "5sDwtE",
        "5sz9Xx", "5sz9SZ", "5qR5j8", "5qVpzE", "5qR5dk", "5qVpr7", "5pVGrB",
        "5porXK", "5ntNsu", "5ntNeL", "5npwpe", "5ntMBL", "5npvHP", "5npvc4",
        "5npuB2", "5mUeTX", "5mUeMT", "5mYuRj", "5mUeFa", "5mUezX", "5mCeH2",
        "5mCeEK", "5mCeCe", "5kSaF6", "5kSadt", "5kS9Na", "5kWnCC", "5kS7hK",
        "5kWn8d", "5kWmBJ", "5kS5SV", "5kWkE1", "5kWk5y", "5kS4Dr", "5kWi6h",
        "5kWgK1", "5kS16D", "5kWfLE", "5kWfih", "5kWdW9", "5jYYNQ", "5jUGHg",
        "5j4g4g", "5j8xLu", "5j8xDo", "5j4fBk", "5j8xgo", "5j4fiT", "5j4iUg",
        "5j8x2q", "5j8zkS", "5j8zh7", "5j8wZ9", "5iUx37", "5iUx11", "5iUwXG",
        "5iUwU3", "5iUwMS", "5iUwEu", "5iUwBw", "5iQeJD", "5iQeGr", "5gYosN",
        "5gU2ni", "5gYogE", "5gYof7", "5dookQ", "5dooed", "5dj3JT", "5doo4q",
        "5bw6u7", "5bkaB5", "5bfSGx", "5bkamL", "5bkajo", "5bfL8n", "5bfKUB",
        "5bk3Hj", "5bk3AE", "5bfKw2", "5bk3ed", "5bk2UG", "5bfK1K", "5bfJVT",
        "5bfJT8", "5bk2EQ", "5bk2By", "5bfJDz", "5bfWTn", "5bkeBj", "5bfWye",
        "59jgWH", "59jgUT", "59oeXE", "59j1EZ", "59oeGC", "59j1vg", "59oets",
        "59oej7", "59oebb", "59oe6G", "59odQb", "59iZCn", "59iZwK", "59odtd",
        "59iZiH", "59obUY", "59iXH6", "58goga", "58kzuy", "58kznf", "58gnSg",
        "58gnK8", "58gnqD", "58kyyG", "56Ewue", "56XjEj", "56Xj5J", "56T8ZV",
        "56T8Wa", "56XiB5", "56Xixd", "4Xmu11", "4GrHto", "4EAn3W", "4EAmLh",
        "4CPMGR", "4CPMzk", "4CU1Gh", "4CPJZR", "4CU1vj", "4Ca9pm", "4Ca8KE",
        "4zTmyB", "4zoLNk", "4xWwmV", "4xWvKi", "4xWvwR", "4xWvov", "4xXJZH",
        "4zdeca", "4zddPV", "4z3ZrE", "4wxeyd", "4p4zoc", "4p8Dso", "4p4Ah2",
        "4oT4pt", "2s9fyE", "2naVoD", "S1gR6", "zms1i", "wwE2i"
      ]
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = Blarney;
  } else if (typeof define == 'function') {
    define(function () {
      return Blarney;
    });
  } else {
    this.Blarney = Blarney;
  }
}).call(this);
