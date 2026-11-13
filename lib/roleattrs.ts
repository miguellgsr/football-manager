// Atributos-chave de cada função do FM, em ordem de prioridade (o 1º pesa mais).
// Fonte: lista informada pelo usuário.
import type { RoleKey } from "./fmroles";

export const ROLE_ATTRS: Record<RoleKey, { ip: Record<string, string[]>; oop: Record<string, string[]> }> = {
  "GK": {
    "ip": {
      "Goalkeeper": [
        "passing",
        "decisions",
        "firstTouch",
        "composure"
      ],
      "Ball-Playing Goalkeeper": [
        "passing",
        "firstTouch",
        "decisions",
        "composure"
      ],
      "No-Nonsense Goalkeeper": [
        "kicking",
        "decisions",
        "concentration",
        "composure"
      ]
    },
    "oop": {
      "Goalkeeper": [
        "reflexes",
        "handling",
        "positioning",
        "oneOnOnes"
      ],
      "Sweeper Keeper": [
        "rushingOut",
        "anticipation",
        "decisions",
        "acceleration"
      ],
      "Line-Holding Goalkeeper": [
        "reflexes",
        "positioning",
        "concentration",
        "handling"
      ]
    }
  },
  "CB": {
    "ip": {
      "Centre-Back": [
        "passing",
        "firstTouch",
        "decisions",
        "composure"
      ],
      "Ball-Playing Centre-Back": [
        "passing",
        "vision",
        "decisions",
        "composure"
      ],
      "No-Nonsense Centre-Back": [
        "heading",
        "strength",
        "decisions",
        "concentration"
      ],
      "Advanced Centre-Back": [
        "dribbling",
        "passing",
        "decisions",
        "firstTouch"
      ]
    },
    "oop": {
      "Centre-Back": [
        "positioning",
        "marking",
        "tackling",
        "anticipation"
      ],
      "Stopping Centre-Back": [
        "anticipation",
        "tackling",
        "decisions",
        "strength"
      ],
      "Covering Centre-Back": [
        "anticipation",
        "positioning",
        "pace",
        "concentration"
      ]
    }
  },
  "CBW": {
    "ip": {
      "Centre-Back": [
        "passing",
        "firstTouch",
        "decisions",
        "composure"
      ],
      "Ball-Playing Centre-Back": [
        "passing",
        "vision",
        "decisions",
        "composure"
      ],
      "No-Nonsense Centre-Back": [
        "heading",
        "strength",
        "decisions",
        "concentration"
      ],
      "Advanced Centre-Back": [
        "dribbling",
        "passing",
        "decisions",
        "firstTouch"
      ],
      "Wide Centre-Back": [
        "passing",
        "firstTouch",
        "decisions",
        "teamwork"
      ],
      "Overlapping Centre-Back": [
        "offTheBall",
        "stamina",
        "passing",
        "decisions"
      ]
    },
    "oop": {
      "Centre-Back": [
        "positioning",
        "marking",
        "tackling",
        "anticipation"
      ],
      "Stopping Centre-Back": [
        "anticipation",
        "tackling",
        "decisions",
        "strength"
      ],
      "Covering Centre-Back": [
        "anticipation",
        "positioning",
        "pace",
        "concentration"
      ],
      "Wide Centre-Back": [
        "positioning",
        "anticipation",
        "marking",
        "pace"
      ],
      "Stopping Wide Centre-Back": [
        "anticipation",
        "tackling",
        "decisions",
        "acceleration"
      ],
      "Covering Wide Centre-Back": [
        "anticipation",
        "positioning",
        "pace",
        "decisions"
      ]
    }
  },
  "FB": {
    "ip": {
      "Full-Back": [
        "passing",
        "firstTouch",
        "decisions",
        "teamwork"
      ],
      "Inside Full-Back": [
        "passing",
        "positioning",
        "decisions",
        "firstTouch"
      ],
      "Wing-Back": [
        "crossing",
        "stamina",
        "pace",
        "passing"
      ],
      "Inside Wing-Back": [
        "passing",
        "decisions",
        "firstTouch",
        "stamina"
      ],
      "Playmaking Wing-Back": [
        "passing",
        "vision",
        "firstTouch",
        "decisions"
      ]
    },
    "oop": {
      "Full-Back": [
        "positioning",
        "marking",
        "tackling",
        "anticipation"
      ],
      "Wing-Back": [
        "stamina",
        "workRate",
        "tackling",
        "positioning"
      ],
      "Pressing Full-Back": [
        "workRate",
        "anticipation",
        "aggression",
        "tackling"
      ],
      "Holding Full-Back": [
        "positioning",
        "marking",
        "concentration",
        "decisions"
      ]
    }
  },
  "WB": {
    "ip": {
      "Wing-Back": [
        "crossing",
        "stamina",
        "pace",
        "workRate"
      ],
      "Advanced Wing-Back": [
        "crossing",
        "pace",
        "stamina",
        "dribbling"
      ],
      "Inside Wing-Back": [
        "passing",
        "decisions",
        "stamina",
        "firstTouch"
      ],
      "Playmaking Wing-Back": [
        "passing",
        "vision",
        "firstTouch",
        "decisions"
      ]
    },
    "oop": {
      "Wing-Back": [
        "stamina",
        "workRate",
        "tackling",
        "positioning"
      ],
      "Pressing Wing-Back": [
        "workRate",
        "anticipation",
        "aggression",
        "acceleration"
      ],
      "Holding Wing-Back": [
        "positioning",
        "marking",
        "concentration",
        "tackling"
      ]
    }
  },
  "DM": {
    "ip": {
      "Defensive Midfielder": [
        "passing",
        "firstTouch",
        "decisions",
        "positioning"
      ],
      "Deep-Lying Playmaker": [
        "passing",
        "vision",
        "firstTouch",
        "decisions"
      ],
      "Half Back": [
        "positioning",
        "passing",
        "decisions",
        "teamwork"
      ],
      "Box-To-Box Midfielder": [
        "stamina",
        "offTheBall",
        "workRate",
        "firstTouch"
      ],
      "Box-To-Box Playmaker": [
        "passing",
        "vision",
        "stamina",
        "decisions"
      ]
    },
    "oop": {
      "Defensive Midfielder": [
        "positioning",
        "tackling",
        "anticipation",
        "teamwork"
      ],
      "Pressing Defensive Midfielder": [
        "workRate",
        "anticipation",
        "aggression",
        "stamina"
      ],
      "Screening Defensive Midfielder": [
        "positioning",
        "anticipation",
        "concentration",
        "marking"
      ],
      "Dropping Defensive Midfielder": [
        "positioning",
        "anticipation",
        "marking",
        "decisions"
      ],
      "Wide Covering Defensive Midfielder": [
        "workRate",
        "anticipation",
        "pace",
        "positioning"
      ]
    }
  },
  "CM": {
    "ip": {
      "Central Midfielder": [
        "passing",
        "firstTouch",
        "decisions",
        "teamwork"
      ],
      "Midfield Playmaker": [
        "passing",
        "vision",
        "firstTouch",
        "decisions"
      ],
      "Wide Central Midfielder": [
        "offTheBall",
        "passing",
        "decisions",
        "stamina"
      ],
      "Attacking Midfielder": [
        "offTheBall",
        "passing",
        "firstTouch",
        "finishing"
      ],
      "Advanced Playmaker": [
        "vision",
        "passing",
        "firstTouch",
        "technique"
      ],
      "Channel Midfielder": [
        "offTheBall",
        "stamina",
        "acceleration",
        "passing"
      ]
    },
    "oop": {
      "Central Midfielder": [
        "positioning",
        "anticipation",
        "teamwork",
        "tackling"
      ],
      "Pressing Central Midfielder": [
        "workRate",
        "anticipation",
        "acceleration",
        "stamina"
      ],
      "Screening Central Midfielder": [
        "positioning",
        "anticipation",
        "concentration",
        "teamwork"
      ],
      "Wide Covering Central Midfielder": [
        "positioning",
        "teamwork",
        "stamina",
        "anticipation"
      ]
    }
  },
  "WM": {
    "ip": {
      "Wide Midfielder": [
        "crossing",
        "passing",
        "decisions",
        "stamina"
      ],
      "Winger": [
        "dribbling",
        "crossing",
        "pace",
        "acceleration"
      ],
      "Inside Winger": [
        "dribbling",
        "passing",
        "offTheBall",
        "decisions"
      ],
      "Playmaking Winger": [
        "passing",
        "vision",
        "firstTouch",
        "technique"
      ]
    },
    "oop": {
      "Wide Midfielder": [
        "workRate",
        "stamina",
        "marking",
        "positioning"
      ],
      "Tracking Wide Midfielder": [
        "workRate",
        "stamina",
        "marking",
        "teamwork"
      ],
      "Wide Outlet Wide Midfielder": [
        "pace",
        "acceleration",
        "offTheBall",
        "firstTouch"
      ]
    }
  },
  "AM": {
    "ip": {
      "Attacking Midfielder": [
        "offTheBall",
        "passing",
        "firstTouch",
        "finishing"
      ],
      "Advanced Playmaker": [
        "vision",
        "passing",
        "firstTouch",
        "technique"
      ],
      "Channel Midfielder": [
        "offTheBall",
        "acceleration",
        "stamina",
        "passing"
      ],
      "Free Role": [
        "vision",
        "decisions",
        "dribbling",
        "offTheBall"
      ],
      "Second Striker": [
        "offTheBall",
        "finishing",
        "anticipation",
        "firstTouch"
      ]
    },
    "oop": {
      "Attacking Midfielder": [
        "positioning",
        "anticipation",
        "workRate",
        "teamwork"
      ],
      "Tracking Attacking Midfielder": [
        "workRate",
        "stamina",
        "marking",
        "teamwork"
      ],
      "Central Outlet Attacking Midfielder": [
        "offTheBall",
        "firstTouch",
        "composure",
        "passing"
      ],
      "Splitting Outlet Attacking Midfielder": [
        "offTheBall",
        "acceleration",
        "pace",
        "anticipation"
      ]
    }
  },
  "W": {
    "ip": {
      "Winger": [
        "dribbling",
        "crossing",
        "pace",
        "acceleration"
      ],
      "Inside Winger": [
        "dribbling",
        "passing",
        "offTheBall",
        "decisions"
      ],
      "Playmaking Winger": [
        "passing",
        "vision",
        "firstTouch",
        "technique"
      ],
      "Inside Forward": [
        "finishing",
        "dribbling",
        "offTheBall",
        "acceleration"
      ],
      "Wide Forward": [
        "finishing",
        "offTheBall",
        "pace",
        "acceleration"
      ]
    },
    "oop": {
      "Winger": [
        "workRate",
        "stamina",
        "positioning",
        "teamwork"
      ],
      "Tracking Winger": [
        "workRate",
        "stamina",
        "marking",
        "teamwork"
      ],
      "Wide Outlet Winger": [
        "pace",
        "acceleration",
        "offTheBall",
        "firstTouch"
      ],
      "Inside Outlet Winger": [
        "acceleration",
        "pace",
        "offTheBall",
        "finishing"
      ]
    }
  },
  "ST": {
    "ip": {
      "Centre Forward": [
        "finishing",
        "offTheBall",
        "firstTouch",
        "composure"
      ],
      "Target Forward": [
        "heading",
        "strength",
        "jumpingReach",
        "firstTouch"
      ],
      "Poacher": [
        "finishing",
        "offTheBall",
        "anticipation",
        "acceleration"
      ],
      "Deep-Lying Forward": [
        "firstTouch",
        "passing",
        "strength",
        "decisions"
      ],
      "False Nine": [
        "passing",
        "vision",
        "firstTouch",
        "offTheBall"
      ],
      "Channel Forward": [
        "pace",
        "acceleration",
        "offTheBall",
        "workRate"
      ]
    },
    "oop": {
      "Centre Forward": [
        "workRate",
        "anticipation",
        "stamina",
        "teamwork"
      ],
      "Tracking Centre Forward": [
        "workRate",
        "stamina",
        "teamwork",
        "marking"
      ],
      "Central Outlet Centre Forward": [
        "firstTouch",
        "strength",
        "offTheBall",
        "balance"
      ],
      "Splitting Outlet Centre Forward": [
        "offTheBall",
        "acceleration",
        "anticipation",
        "pace"
      ]
    }
  }
};
