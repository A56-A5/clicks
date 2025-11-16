import { Mesh, PlaneGeometry, MeshBasicMaterial, CanvasTexture } from "three";

export default class TypingPanel {
  constructor(scene, options = {}) {
    this.scene = scene;
    //expandable dictionary
    this.dictionary = [
          "ability","able","about","above","accept","account","across","act","action","active",
          "actor","actual","add","admit","adult","advance","advice","affair","affect","after",
          "again","against","age","agency","agent","agree","ahead","aid","aim","air",
          "airport","alarm","album","alive","allow","almost","alone","along","already","also",
          "alter","always","amazing","among","amount","analysis","animal","announce","another","answer",
          "any","anybody","anyone","anything","anyway","apart","apartment","appeal","appear","apple",
          "apply","appoint","approach","approve","area","argue","arm","around","arrange","arrest",
          "arrival","arrive","art","article","artist","as","ask","aspect","assess","asset",
          "assist","assume","at","attack","attempt","attend","attention","attitude","attorney","audience",
          "author","authority","auto","available","average","avoid","award","aware","away","baby",
          "back","background","bad","bag","balance","ball","ban","bank","bar","barely",
          "base","basic","basis","basket","battle","be","beach","bear","beat","beautiful",
          "because","become","bed","bedroom","beer","before","begin","behavior","behind","being",
          "belief","believe","bell","belong","below","belt","bench","bend","benefit","best",
          "bet","better","between","beyond","big","bike","bill","billion","bind","bird",
          "birth","birthday","bit","black","blade","blank","block","blood","blue","board",
          "boat","body","boil","bomb","bond","bone","book","boot","border","born",
          "borrow","boss","both","bottle","bottom","bought","box","boy","brain","branch",
          "brand","brave","bread","break","breath","brick","bridge","brief","bright","bring",
          "broad","brother","brown","brush","budget","build","building","bullet","bunch","burn",
          "burst","business","busy","but","butter","button","buy","cable","cake","calculate",
          "call","calm","camera","camp","campaign","campus","can","cancel","cancer","candidate",
          "cap","capable","capital","captain","car","card","care","career","careful","cargo",
          "carpet","carry","case","cash","cast","castle","cat","catch","category","cause",
          "ceiling","cell","center","central","century","certain","chain","chair","chairman","challenge",
          "chamber","chance","change","channel","chapter","character","charge","charity","chart","check",
          "cheek","cheer","cheese","chef","chemical","chest","chicken","chief","child","chimney",
          "choice","choose","church","circle","citizen","city","civil","claim","class","classic",
          "clean","clear","clearly","clerk","click","client","cliff","climate","climb","clock",
          "close","closely","cloth","cloud","club","clue","coach","coal","coast","coat",
          "code","coffee","coin","cold","collect","collection","college","color","column","combat",
          "come","comfort","command","comment","commerce","commit","committee","common","company","compare",
          "compete","complete","complex","compose","computer","concept","concern","concert","conduct","confirm",
          "conflict","confuse","connect","consider","consist","constant","construct","contact","contain","content",
          "contest","continue","contract","control","convert","cook","cool","cooperate","copy","core",
          "corner","correct","cost","cotton","could","council","count","country","county","couple",
          "courage","course","court","cousin","cover","cow","crack","craft","crash","crazy",
          "cream","create","credit","crew","crime","crisis","critic","crop","cross","crowd",
          "crucial","cry","culture","cup","curious","current","curve","custom","customer","cut",
          "cycle","daily","damage","dance","danger","dare","dark","data","date","daughter",
          "day","dead","deal","dealer","dear","death","debate","decade","decide","decision",
          "declare","decline","deep","deer","defeat","defend","define","degree","delay","deliver",
          "demand","democracy","democrat","deny","department","depend","deposit","describe","desert","design",
          "desire","desk","despite","destroy","detail","detect","determine","develop","device","devote",
          "diagram","dialog","diamond","diary","dictionary","die","differ","difference","different","difficult",
          "dinner","direct","direction","director","dirt","disagree","disappear","discount","discover","discuss",
          "discussion","disease","dish","dismiss","display","distance","district","divide","doctor","document",
          "dog","door","double","doubt","down","draft","drag","drama","draw","dream",
          "dress","drink","drive","driver","drop","drug","dry","due","during","dust",
          "duty","each","eager","ear","early","earn","earth","ease","east","easy",
          "eat","economic","economy","edge","edit","educate","effect","effort","egg","eight",
          "either","elder","elect","election","electric","element","elevator","else","email","embark",
          "embrace","emerge","emotion","emphasis","employ","empty","enable","encounter","encourage","end",
          "enemy","energy","engage","engine","enhance","enjoy","enough","ensure","enter","entire",
          "entry","environment","equal","equipment","era","error","escape","especially","essay","essential",
          "establish","estate","estimate","ethics","even","evening","event","eventually","ever","every",
          "everyone","everything","evidence","evil","exact","examine","example","excellent","except","exchange",
          "excite","exclude","excuse","exercise","exist","exit","expand","expect","expense","experience",
          "experiment","expert","explain","explode","explore","express","extend","extra","eye","fabric",
          "face","fact","factor","factory","fail","fair","faith","fall","false","fame",
          "familiar","family","famous","fan","fancy","far","farm","farmer","fashion","fast",
          "fat","fate","father","fault","fear","feature","federal","feed","feel","female",
          "fence","festival","fetch","few","field","fierce","fight","figure","file","fill",
          "film","filter","final","finance","find","fine","finger","finish","fire","firm",
          "first","fish","fit","fix","flag","flame","flash","flat","flavor","flee",
          "flesh","flight","float","floor","flow","flower","fly","focus","fold","follow",
          "food","foot","football","for","force","forest","forget","forgive","fork","form",
          "formal","fortune","forward","found","foundation","four","frame","free","freedom","freeze",
          "fresh","friend","friendly","from","front","fruit","fuel","full","fun","function",
          "fund","funny","furniture","future","gain","game","gap","garage","garden","gas",
          "gate","gather","gaze","general","generate","gentle","gift","girl","give","glad",
          "glass","global","glove","go","goal","god","gold","golf","good","govern",
          "government","grab","grade","grain","grand","grant","grass","grave","great","green",
          "greet","grey","grid","ground","group","grow","growth","guard","guess","guest",
          "guide","guilty","guitar","habit","hair","half","hall","hand","handle","hang",
          "happen","happy","harbor","hard","harm","hat","hate","have","head","health",
          "hear","heart","heat","heavy","height","hell","hello","help","hence","her",
          "here","hero","hidden","hide","high","highlight","hill","hire","history","hit",
          "hold","hole","holiday","home","honest","honey","hook","hope","horse","hospital",
          "host","hot","hotel","hour","house","hover","huge","human","humor","hundred",
          "hunger","hunt","hurry","hurt","husband","ice","idea","ideal","identify","idle",
          "ignore","ill","illegal","illness","image","imagine","impact","impose","impress","improve",
          "include","income","increase","indeed","index","indicate","industry","infant","inform","initial",
          "injury","inner","innocent","input","inquiry","inside","insight","insist","inspect","inspire",
          "install","instance","instead","institution","instruction","instrument","insurance","intact","interest","internal",
          "international","internet","interpret","interrupt","interval","interview","into","introduce","invent","invest",
          "invite","involve","iron","island","issue","item","jacket","jail","job","join",
          "joint","joke","journey","joy","judge","juice","jump","jungle","junior","jury",
          "just","keep","key","kick","kid","kill","kind","king","kiss","kitchen",
          "knee","knife","knock","know","label","labor","lack","ladder","lady","lake",
          "land","landscape","language","large","last","late","laugh","launch","law","lawn",
          "lawsuit","lawyer","layer","lead","leader","leaf","league","learn","least","leather",
          "leave","lecture","left","leg","legal","legend","lemon","lend","length","less",
          "lesson","let","letter","level","liberal","library","license","lie","life","lift",
          "light","limit","line","link","lip","liquid","list","listen","literature","little",
          "live","load","loan","local","locate","lock","log","logic","lonely","long",
          "look","loose","lord","lose","loss","lot","loud","love","lovely","lower",
          "loyal","luck","lucky","lunch","machine","mad","magazine","magic","mail","main",
          "maintain","major","make","male","mall","man","manage","manner","manual","manufacture",
          "many","map","march","mark","market","marriage","marry","mask","mass","master",
          "match","material","math","matter","maximum","may","maybe","meal","mean","measure",
          "meat","mechanic","media","medical","meet","melt","member","memory","mention","menu",
          "merchant","mess","metal","method","middle","might","mild","military","milk","million",
          "mind","mine","minimum","minor","minute","miracle","mirror","miss","mission","mistake",
          "mix","mixed","mixture","mobile","mode","model","modern","moment","money","monitor",
          "month","mood","moon","moral","more","morning","mortgage","most","mother","motion",
          "motor","mount","mountain","mouse","mouth","move","movie","much","multiple","murder",
          "muscle","museum","music","must","mutual","myself","name","narrow","nation","native",
          "natural","nature","near","nearly","neck","need","negative","neighbor","neither","nerve",
          "net","network","never","new","news","newspaper","next","nice","night","nine",
          "nobody","noise","nominate","none","normal","north","nose","note","nothing","notice",
          "notion","novel","now","nuclear","number","nurse","object","observe","obtain","obvious",
          "occasion","occupy","occur","ocean","odd","off","offer","office","officer","official",
          "often","oil","okay","old","once","one","ongoing","only","onto","open",
          "operate","opinion","oppose","option","order","ordinary","organ","organic","organization","organize",
          "origin","original","other","otherwise","ought","our","out","outcome","outside","over",
          "overall","owe","owner","pace","pack","package","page","pain","paint","pair",
          "pale","panel","panic","paper","parent","park","part","participate","particular","partner",
          "party","pass","passage","past","path","patient","pattern","pause","pay","peace",
          "peak","peer","pen","penalty","people","pepper","per","perfect","perform","perhaps",
          "period","permit","person","personal","persuade","pet","phase","phone","photo","phrase",
          "physical","piano","pick","picture","piece","pile","pilot","pin","pipe","pitch",
          "place","plan","plane","planet","plant","plastic","plate","play","player","please",
          "pleasure","plenty","plot","plus","pocket","poem","poet","point","police","policy",
          "political","politics","poll","pool","poor","popular","population","port","position","positive",
          "possess","possible","post","pot","potato","pound","pour","poverty","powder","power",
          "practical","practice","pray","precise","predict","prefer","prepare","presence","present","preserve",
          "press","pressure","pretend","pretty","prevent","price","pride","primary","prime","principal",
          "principle","print","prior","priority","prison","private","prize","probably","problem","proceed",
          "process","produce","product","profession","profile","profit","program","progress","project","promise",
          "promote","proof","proper","property","proposal","propose","prospect","protect","protein","protest",
          "proud","prove","provide","public","publish","pull","pulse","pump","punch","punish",
          "purchase","pure","purpose","pursue","push","put","qualify","quality","quantity","quarter",
          "queen","question","quick","quiet","quit","quite","quote","race","radio","rail",
          "rain","raise","range","rank","rapid","rare","rate","rather","ratio","raw",
          "reach","react","read","ready","real","reality","realize","reason","rebel","recall",
          "receive","recent","recipe","record","recover","red","reduce","refer","reflect","reform",
          "refuse","regard","region","regret","regular","reject","relate","relation","relative","relax",
          "release","relevant","relief","religion","remain","remark","remember","remind","remote","remove",
          "rent","repair","repeat","replace","reply","report","request","require","rescue","research",
          "reserve","resist","resource","respect","respond","response","responsible","rest","result","retain",
          "retire","return","reveal","review","reward","rice","rich","ride","ridiculous","right",
          "ring","rise","risk","river","road","rock","role","roll","romantic","roof",
          "room","root","rope","rough","round","route","routine","row","rub","rule",
          "run","rush","sad","safe","safety","sail","salary","sale","salt","same",
          "sample","sand","satisfy","save","say","scale","scan","scene","scheme","school",
          "science","scientist","score","screen","script","sea","search","season","seat","second",
          "secret","section","sector","secure","security","see","seed","seek","seem","segment",
          "select","self","sell","send","senior","sense","sentence","separate","series","serious",
          "serve","service","session","set","settle","seven","several","severe","sex","shade",
          "shadow","shake","shall","shape","share","sharp","she","sheep","sheet","shelf",
          "shell","shift","shine","ship","shirt","shock","shoe","shoot","shop","short",
          "should","shoulder","shout","show","shower","shut","sick","side","sight","sign",
          "signal","significance","silent","silver","similar","simple","since","sing","single","sink",
          "sir","sister","sit","site","situation","six","size","skill","skin","skip",
          "sky","slave","sleep","slice","slide","slight","slow","small","smart","smell",
          "smile","smoke","smooth","snake","snow","so","social","society","sock","soft",
          "software","soil","solar","soldier","solid","solution","solve","some","somebody","someone",
          "something","sometimes","somewhat","somewhere","son","song","soon","sorry","sort","soul",
          "sound","soup","source","south","space","spare","speak","special","species","specific",
          "speech","speed","spell","spend","spin","spirit","spite","split","spoil","sport",
          "spot","spray","spread","spring","square","stable","staff","stage","stair","stake",
          "stand","standard","star","stare","start","state","statement","station","status","stay",
          "steady","steal","steam","steel","step","stick","still","stock","stomach","stone",
          "stop","store","storm","story","straight","strange","strategy","stream","street","strength",
          "stress","stretch","strike","string","strip","stroke","strong","structure","struggle","student",
          "studio","study","stuff","stupid","style","subject","submit","substance","succeed","success",
          "such","sudden","suffer","sugar","suggest","suit","summer","sun","super","supply",
          "support","suppose","sure","surface","surprise","surround","survey","survive","suspect","swear",
          "sweet","swift","swim","swing","switch","symbol","system","table","tackle","tactic",
          "tail","take","tale","talent","talk","tall","tank","tap","target","task",
          "taste","tax","tea","teach","teacher","team","tear","technical","technique","technology",
          "telephone","tell","temperature","temporary","ten","tend","tennis","tension","tent","term",
          "terrible","territory","test","text","than","thank","that","the","theme","then",
          "theory","there","therefore","these","they","thick","thin","thing","think","third",
          "thirty","this","though","thought","thousand","thread","threat","three","throat","through",
          "throw","thumb","thus","ticket","tie","tight","time","tiny","tip","tire",
          "title","to","today","toe","together","tomorrow","tone","tongue","tonight","tool",
          "tooth","top","topic","total","touch","tough","tour","toward","tower","town",
          "toy","track","trade","traffic","train","transfer","trash","travel","treat","tree",
          "trend","trial","tribe","trick","trip","troop","trouble","truck","true","trust",
          "truth","try","tube","tune","turn","twin","twist","two","type","typical",
          "ugly","ultimate","unable","uncle","under","understand","unit","universe","unknown","unless",
          "until","unusual","up","upon","upper","upset","urban","urge","use","used",
          "useful","user","usual","utility","vacation","valley","valuable","value","variety","various",
          "vast","vehicle","version","very","vessel","victim","victory","video","view","village",
          "violent","visible","vision","visit","visual","voice","volume","vote","wait","wake",
          "walk","wall","want","war","warm","warn","wash","waste","watch","water",
          "wave","way","we","weak","wealth","weapon","wear","weather","web","wedding",
          "week","weekend","weigh","weight","welcome","well","west","wet","what","whatever",
          "wheel","when","where","whether","which","while","whisper","white","who","whole",
          "whose","why","wide","wife","wild","will","win","wind","window","wine",
          "wing","winner","winter","wire","wisdom","wise","wish","with","within","without",
          "witness","woman","wonder","wood","word","work","worker","world","worry","worth",
          "would","wound","wrap","write","writer","wrong","yard","yeah","year","yellow",
          "yes","yesterday","yet","you","young","your","youth","zero","zone"
    ];

    this.maxWords = options.maxWords || 50;
    this.wordsQueue = [];
    this.typedString = "";
    this.wordIndex = 0;
    this.charIndex = 0;

    // initialize words queue
    for (let i = 0; i < this.maxWords; i++) {
      this.wordsQueue.push(this.dictionary[Math.floor(Math.random() * this.dictionary.length)] + " ");
    }

    this.createMesh(options.position || { x: 0, y: 25, z: 5 });
  }

  createMesh(position) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.font = "48px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "gray";
    ctx.fillText(this.wordsQueue.join(" "), 0, 32);

    const tex = new CanvasTexture(canvas);
    const mat = new MeshBasicMaterial({ map: tex, transparent: true });
    const geom = new PlaneGeometry(canvas.width / 4, canvas.height / 4);
    const mesh = new Mesh(geom, mat);

    mesh.position.set(position.x, position.y, position.z);
    this.scene.add(mesh);

    this.mesh = mesh;
    this.canvas = canvas;
    this.ctx = ctx;
    this.texture = tex;

    this.updateMesh();
  }

  updateMesh() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "48px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let x = 0;
    for (let w = 0; w < this.wordsQueue.length; w++) {
      const word = this.wordsQueue[w];
      for (let c = 0; c < word.length; c++) {
        if (w === this.wordIndex) {
            //coloring for current word
          ctx.fillStyle = (c < this.charIndex ? (this.typedString[c] === word[c] ? "white" : "red") : "gray");
        } else ctx.fillStyle = (w < this.wordIndex ? "white" : "gray");
        ctx.fillText(word[c], x, 32);
        x += ctx.measureText(word[c]).width;
      }
      ctx.fillText(" ", x, 32);
      x += ctx.measureText(" ").width;
    }

    this.texture.needsUpdate = true;
  }

  handleKey(key) {
    const currentWord = this.wordsQueue[this.wordIndex];
    if (!currentWord) return;

    if (key === "Backspace") {
      if (this.charIndex > 0) {
        this.charIndex--;
        this.typedString = this.typedString.slice(0, -1);
      }
    } else if (key.length === 1) {
      if (this.charIndex < currentWord.length) {
        this.typedString += key;
        this.charIndex++;
      }
      if (this.charIndex === currentWord.length && key === " ") this.charIndex++;
    }

    // move to next word
    if (this.charIndex >= currentWord.length) {
      this.wordIndex++;
      this.charIndex = 0;
      this.typedString = "";
      this.wordsQueue.push(this.dictionary[Math.floor(Math.random() * this.dictionary.length)]);
      if (this.wordsQueue.length > this.maxWords) {
        this.wordsQueue.shift();
        if (this.wordIndex > 0) this.wordIndex--;
      }
    }

    this.updateMesh();
  }
}
