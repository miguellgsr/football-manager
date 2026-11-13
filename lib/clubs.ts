// Catálogo de clubes: continente > país > liga > clubes, com cores (principal e secundária).
// Sem escudos (marcas registradas). Ligas marcadas "parcial" não têm todos os clubes; use "Adicionar clube".
// Formato de cada clube: "Nome|#principal|#secundária".

export interface CatClub { name: string; p: string; s: string }
export interface CatLeague { name: string; clubs: CatClub[] }
export interface CatCountry { name: string; continent: string; leagues: CatLeague[] }

const L = (name: string, raw: string): CatLeague => ({
  name,
  clubs: raw.trim().split("\n").map((l) => {
    const [n, p, s] = l.trim().split("|");
    return { name: n, p, s };
  }),
});

export const CATALOG: CatCountry[] = [
  {
    name: "Brasil", continent: "América do Sul", leagues: [
      L("Série A", `
Athletico-PR|#E4002B|#000000
Atlético-MG|#000000|#FFFFFF
Bahia|#005CA9|#E5050F
Botafogo|#000000|#FFFFFF
Chapecoense|#00A651|#FFFFFF
Corinthians|#000000|#FFFFFF
Coritiba|#00553E|#FFFFFF
Cruzeiro|#003DA5|#FFFFFF
Flamengo|#C3281E|#000000
Fluminense|#7A1E3A|#00913F
Grêmio|#0D80BF|#000000
Internacional|#E5050F|#FFFFFF
Mirassol|#FFD100|#006437
Palmeiras|#006437|#FFFFFF
Red Bull Bragantino|#FFFFFF|#C8102E
Remo|#002A5C|#FFFFFF
Santos|#FFFFFF|#000000
São Paulo|#E4002B|#000000
Vasco da Gama|#000000|#FFFFFF
Vitória|#E4002B|#000000`),
      L("Série B (parcial)", `
América-MG|#00A859|#000000
Athletic-MG|#000000|#FFFFFF
Atlético-GO|#E4002B|#000000
Avaí|#00539F|#FFFFFF
Botafogo-SP|#E4002B|#000000
Ceará|#000000|#FFFFFF
Criciúma|#FFD100|#000000
CRB|#E4002B|#FFFFFF
Cuiabá|#FFD100|#00A859
Fortaleza|#003DA5|#E4002B
Goiás|#00A859|#FFFFFF
Juventude|#00A859|#FFFFFF
Londrina|#0077C8|#FFFFFF
Náutico|#E4002B|#FFFFFF
Novorizontino|#FFD100|#000000
Operário-PR|#000000|#FFFFFF
Ponte Preta|#000000|#FFFFFF
São Bernardo|#FFD100|#000000
Sport|#E4002B|#000000
Vila Nova|#E4002B|#FFFFFF
Volta Redonda|#FFD100|#8A8D8F`),
      L("Série C (parcial)", `
Amazonas|#FFD100|#00A859
Botafogo-PB|#000000|#FFFFFF
Brusque|#E4002B|#FFD100
Caxias|#7A1E3A|#00A859
Confiança|#003DA5|#FFFFFF
Ferroviária|#7A1E3A|#FFFFFF
Figueirense|#000000|#FFFFFF
Floresta|#00A859|#FFFFFF
Guarani|#00A859|#FFFFFF
Inter de Limeira|#E4002B|#000000
Paysandu|#00A3E0|#FFFFFF
Santa Cruz|#E4002B|#000000
Ypiranga-RS|#FFD100|#00A859`),
    ],
  },
  {
    name: "Argentina", continent: "América do Sul", leagues: [
      L("Liga Profesional", `
Aldosivi|#FFD100|#00A859
Argentinos Juniors|#E4002B|#FFFFFF
Atlético Tucumán|#6CACE4|#FFFFFF
Banfield|#00A859|#FFFFFF
Barracas Central|#E4002B|#FFFFFF
Belgrano|#6CACE4|#FFFFFF
Boca Juniors|#0A2A66|#FFD100
Central Córdoba (SdE)|#000000|#FFFFFF
Defensa y Justicia|#FFD100|#00A859
Estudiantes (LP)|#E4002B|#FFFFFF
Estudiantes (RC)|#E4002B|#FFFFFF
Gimnasia (LP)|#0A2A66|#FFFFFF
Gimnasia (Mendoza)|#0A2A66|#FFFFFF
Huracán|#FFFFFF|#E4002B
Independiente|#E4002B|#FFFFFF
Independiente Rivadavia|#003DA5|#FFFFFF
Instituto|#E4002B|#FFFFFF
Lanús|#7A1E3A|#FFFFFF
Newell's Old Boys|#E4002B|#000000
Platense|#6B3E1E|#FFFFFF
Racing Club|#6CACE4|#FFFFFF
River Plate|#FFFFFF|#E4002B
Riestra|#000000|#FFFFFF
Rosario Central|#0A2A66|#FFD100
San Lorenzo|#0A2A66|#E4002B
Sarmiento|#00A859|#FFFFFF
Talleres|#0A2A66|#FFFFFF
Tigre|#0A2A66|#E4002B
Unión|#E4002B|#FFFFFF
Vélez Sarsfield|#FFFFFF|#0A2A66`),
      L("Primera Nacional (parcial)", `
Colón|#E4002B|#000000
Godoy Cruz|#0A2A66|#FFFFFF
San Martín (SJ)|#00A859|#000000`),
    ],
  },
  {
    name: "Inglaterra", continent: "Europa", leagues: [
      L("Premier League", `
Arsenal|#EF0107|#FFFFFF
Aston Villa|#670E36|#95BFE5
Bournemouth|#DA291C|#000000
Brentford|#E30613|#FFFFFF
Brighton|#0057B8|#FFFFFF
Chelsea|#034694|#FFFFFF
Coventry City|#59CBE8|#FFFFFF
Crystal Palace|#1B458F|#C4122E
Everton|#003399|#FFFFFF
Fulham|#FFFFFF|#CC0000
Hull City|#F5A12D|#000000
Ipswich Town|#0044AA|#FFFFFF
Leeds United|#FFFFFF|#1D428A
Liverpool|#C8102E|#F6EB61
Manchester City|#6CABDD|#1C2C5B
Manchester United|#DA291C|#FBE122
Newcastle United|#241F20|#FFFFFF
Nottingham Forest|#DD0000|#FFFFFF
Sunderland|#EB172B|#FFFFFF
Tottenham Hotspur|#132257|#FFFFFF`),
      L("Championship", `
Birmingham City|#0000FF|#FFFFFF
Blackburn Rovers|#009EE0|#FFFFFF
Bolton Wanderers|#FFFFFF|#0A2A66
Bristol City|#E21A2C|#FFFFFF
Burnley|#6C1D45|#99D6EA
Cardiff City|#0070B5|#FFFFFF
Charlton Athletic|#D4021D|#FFFFFF
Derby County|#FFFFFF|#000000
Lincoln City|#E4002B|#FFFFFF
Middlesbrough|#E4002B|#FFFFFF
Millwall|#001D5E|#FFFFFF
Norwich City|#00A650|#FFF200
Portsmouth|#001489|#FFFFFF
Preston North End|#FFFFFF|#0A2A66
Queens Park Rangers|#005CAB|#FFFFFF
Sheffield United|#EE2737|#000000
Southampton|#D71920|#FFFFFF
Stoke City|#E03A3E|#FFFFFF
Swansea City|#FFFFFF|#000000
Watford|#FBEE23|#ED2127
West Bromwich Albion|#122F67|#FFFFFF
West Ham United|#7A263A|#1BB1E7
Wolverhampton Wanderers|#FDB913|#231F20
Wrexham|#D71920|#FFFFFF`),
      L("League One", `
AFC Wimbledon|#0A2A66|#FFD100
Barnsley|#E4002B|#FFFFFF
Blackpool|#F68712|#FFFFFF
Bradford City|#7A1E3A|#FFD100
Bromley|#000000|#FFFFFF
Burton Albion|#FFD100|#000000
Cambridge United|#FFB81C|#000000
Doncaster Rovers|#E4002B|#FFFFFF
Huddersfield Town|#0E63AD|#FFFFFF
Leicester City|#003090|#FDBE11
Leyton Orient|#E4002B|#FFFFFF
Luton Town|#F78F1E|#002D62
Mansfield Town|#FFD100|#0A2A66
MK Dons|#FFFFFF|#E4002B
Notts County|#000000|#FFFFFF
Oxford United|#FFD100|#0A2A66
Peterborough United|#005CA9|#FFFFFF
Plymouth Argyle|#00674F|#FFFFFF
Reading|#004494|#FFFFFF
Sheffield Wednesday|#0E4C92|#FFFFFF
Stevenage|#E4002B|#FFFFFF
Stockport County|#005CA9|#FFFFFF
Wigan Athletic|#005CA9|#FFFFFF
Wycombe Wanderers|#0A2A66|#6CACE4`),
    ],
  },
  {
    name: "Espanha", continent: "Europa", leagues: [
      L("La Liga", `
Alavés|#0761AF|#FFFFFF
Athletic Club|#EE2523|#FFFFFF
Atlético de Madrid|#CB3524|#272E61
Barcelona|#A50044|#004D98
Celta de Vigo|#8AC3EE|#FFFFFF
Deportivo La Coruña|#005CA9|#FFFFFF
Elche|#00A859|#FFFFFF
Espanyol|#007FC8|#FFFFFF
Getafe|#005999|#FFFFFF
Levante|#A50044|#0A2A66
Málaga|#0070BA|#FFFFFF
Osasuna|#D91A21|#0A1F44
Racing Santander|#00A859|#FFFFFF
Rayo Vallecano|#FFFFFF|#E4002B
Real Betis|#00954C|#FFFFFF
Real Madrid|#FFFFFF|#FEBE10
Real Sociedad|#0067B1|#FFFFFF
Sevilla|#FFFFFF|#D4021D
Valencia|#FFFFFF|#000000
Villarreal|#FBE10F|#005187`),
      L("Segunda División (parcial)", `
Almería|#E4002B|#FFFFFF
Cádiz|#FFD100|#0A2A66
Castellón|#000000|#FFFFFF
Girona|#E4002B|#FFFFFF
Granada|#E4002B|#FFFFFF
Las Palmas|#FFD100|#0A2A66
Mallorca|#E4002B|#000000
Real Oviedo|#0A2A66|#FFFFFF
Sporting de Gijón|#E4002B|#FFFFFF`),
    ],
  },
  {
    name: "Itália", continent: "Europa", leagues: [
      L("Serie A", `
Atalanta|#1E71B8|#000000
Bologna|#1A2F48|#A21C26
Cagliari|#A6192E|#0A2A66
Como|#0A4DA2|#FFFFFF
Fiorentina|#5B2C83|#FFFFFF
Frosinone|#FFD100|#0A2A66
Genoa|#A6192E|#0A2A66
Inter|#0068A8|#000000
Juventus|#FFFFFF|#000000
Lazio|#87D8F7|#FFFFFF
Lecce|#FFD100|#E4002B
Milan|#FB090B|#000000
Monza|#E4002B|#FFFFFF
Napoli|#12A0D7|#FFFFFF
Parma|#FFD100|#0A2A66
Roma|#8E1F2F|#F0BC42
Sassuolo|#00A859|#000000
Torino|#8B1E3F|#FFFFFF
Udinese|#000000|#FFFFFF
Venezia|#000000|#00A859`),
      L("Serie B (parcial)", `
Bari|#E4002B|#FFFFFF
Catanzaro|#FFD100|#E4002B
Cremonese|#E4002B|#8A8D8F
Empoli|#0070BA|#FFFFFF
Hellas Verona|#FFD100|#0A2A66
Palermo|#F4A7B9|#000000
Pisa|#000000|#0A2A66
Sampdoria|#0A4DA2|#FFFFFF`),
    ],
  },
  {
    name: "Alemanha", continent: "Europa", leagues: [
      L("Bundesliga", `
Augsburg|#BA3733|#FFFFFF
Bayer Leverkusen|#E32221|#000000
Bayern de Munique|#DC052D|#0066B2
Borussia Dortmund|#FDE100|#000000
Borussia Mönchengladbach|#FFFFFF|#00A859
Eintracht Frankfurt|#E1000F|#000000
Elversberg|#000000|#FFFFFF
Freiburg|#E4002B|#000000
Hamburgo|#0A4DA2|#FFFFFF
Hoffenheim|#1961B5|#FFFFFF
Köln|#E4002B|#FFFFFF
Mainz 05|#C3141E|#FFFFFF
Paderborn|#0A2A66|#000000
RB Leipzig|#DD0741|#FFFFFF
Schalke 04|#004D9D|#FFFFFF
Stuttgart|#E32219|#FFFFFF
Union Berlin|#EB1923|#FFD100
Werder Bremen|#1D9053|#FFFFFF`),
      L("2. Bundesliga (parcial)", `
Hannover 96|#00A859|#000000
Hertha Berlim|#005CA9|#FFFFFF
Heidenheim|#E4002B|#0A2A66
Karlsruhe|#0A2A66|#FFFFFF
Magdeburg|#005CA9|#FFFFFF
Nuremberg|#8B1E3F|#000000
St. Pauli|#6B3E1E|#FFFFFF
Wolfsburg|#65B32E|#FFFFFF`),
    ],
  },
  {
    name: "França", continent: "Europa", leagues: [
      L("Ligue 1", `
Angers|#000000|#FFFFFF
Auxerre|#0A4DA2|#FFFFFF
Brest|#E4002B|#FFFFFF
Le Havre|#6CACE4|#0A2A66
Le Mans|#FFD100|#E4002B
Lens|#FFD100|#E4002B
Lille|#E4002B|#0A2A66
Lorient|#F58220|#000000
Lyon|#FFFFFF|#0A2A66
Marseille|#2FAEE0|#FFFFFF
Monaco|#E4002B|#FFFFFF
Nice|#E4002B|#000000
Paris FC|#0A2A66|#FFFFFF
Paris Saint-Germain|#004170|#DA291C
Rennes|#E4002B|#000000
Strasbourg|#0070BA|#FFFFFF
Toulouse|#5B2C83|#FFFFFF
Troyes|#0A4DA2|#FFFFFF`),
      L("Ligue 2 (parcial)", `
Metz|#7A1E3A|#FFFFFF
Nantes|#FFD100|#00A859
Saint-Étienne|#00A859|#FFFFFF
Sochaux|#FFD100|#0A2A66`),
    ],
  },
  {
    name: "Portugal", continent: "Europa", leagues: [
      L("Primeira Liga", `
Alverca|#E4002B|#0A2A66
Arouca|#FFD100|#0A2A66
Benfica|#E4002B|#FFFFFF
Braga|#E4002B|#FFFFFF
Casa Pia|#000000|#FFFFFF
Estoril|#FFD100|#0A2A66
Estrela da Amadora|#E4002B|#00A859
Famalicão|#0A2A66|#FFFFFF
Gil Vicente|#E4002B|#0A2A66
Marítimo|#E4002B|#00A859
Moreirense|#00A859|#FFFFFF
Nacional|#000000|#FFFFFF
Porto|#003DA5|#FFFFFF
Rio Ave|#00A859|#FFFFFF
Santa Clara|#E4002B|#FFFFFF
Sporting CP|#00A859|#FFFFFF
Vitória SC|#FFFFFF|#000000
Académico de Viseu|#00A859|#FFFFFF`),
      L("Liga Portugal 2 (parcial)", `
AVS|#E4002B|#FFFFFF
Tondela|#00A859|#FFD100
Torreense|#E4002B|#FFFFFF
Vizela|#E4002B|#FFFFFF
Académica|#000000|#FFFFFF`),
    ],
  },
  {
    name: "Países Baixos", continent: "Europa", leagues: [
      L("Eredivisie", `
ADO Den Haag|#00A859|#FFD100
Ajax|#D2122E|#FFFFFF
AZ Alkmaar|#E4002B|#FFFFFF
Cambuur|#FFD100|#0A2A66
Excelsior|#E4002B|#000000
Feyenoord|#E4002B|#FFFFFF
Fortuna Sittard|#FFD100|#00A859
Go Ahead Eagles|#E4002B|#FFD100
Groningen|#00A859|#FFFFFF
Heerenveen|#0A4DA2|#FFFFFF
NEC Nijmegen|#E4002B|#00A859
PEC Zwolle|#0A4DA2|#FFFFFF
PSV|#E4002B|#FFFFFF
Sparta Rotterdam|#E4002B|#FFFFFF
Telstar|#FFFFFF|#000000
Twente|#E4002B|#FFFFFF
Utrecht|#E4002B|#FFFFFF
Willem II|#E4002B|#0A4DA2`),
      L("Eerste Divisie (parcial)", `
Heracles Almelo|#FFFFFF|#000000
NAC Breda|#FFD100|#000000
Volendam|#F58220|#000000`),
    ],
  },
  {
    name: "Arábia Saudita", continent: "Ásia/Oceania", leagues: [
      L("Roshn Saudi League (parcial)", `
Al-Ahli|#0B7A3B|#FFFFFF
Al-Hilal|#0A4DA2|#FFFFFF
Al-Ittihad|#FFD100|#000000
Al-Ittifaq|#00A651|#FFFFFF
Al-Nassr|#FFD500|#0A2A66
Al-Shabab|#FFFFFF|#000000
Al-Taawoun|#F58220|#FFFFFF`),
    ],
  },
  {
    name: "EUA", continent: "América do Norte", leagues: [
      L("MLS", `
Atlanta United|#80000A|#000000
Austin FC|#00B140|#000000
Charlotte FC|#1A85C8|#000000
Chicago Fire|#9A1B2F|#FFFFFF
FC Cincinnati|#F05323|#003087
Colorado Rapids|#862633|#8BB8E8
Columbus Crew|#FEDD00|#000000
D.C. United|#000000|#EF3E42
FC Dallas|#E81F3E|#2A3E7B
Houston Dynamo|#FF6B00|#101820
Inter Miami|#F7B5CD|#000000
LA Galaxy|#00245D|#FFB81C
Los Angeles FC|#000000|#C39E6D
Minnesota United|#8CD2F4|#231F20
CF Montréal|#000000|#0A4DA2
Nashville SC|#ECE83A|#1F1646
New England Revolution|#0A2240|#CE0E2D
New York City FC|#6CACE4|#F15524
New York Red Bulls|#ED1E36|#FFFFFF
Orlando City|#633492|#FDE192
Philadelphia Union|#071B2C|#B19B69
Portland Timbers|#004812|#EBE72B
Real Salt Lake|#B30838|#013A81
San Diego FC|#8DC8E8|#E31837
San Jose Earthquakes|#0067B1|#000000
Seattle Sounders|#5D9741|#005595
Sporting Kansas City|#93B1D7|#0F1D41
St. Louis City|#E4002B|#0A2A66
Toronto FC|#B81137|#455560
Vancouver Whitecaps|#00245E|#9DC2EA`),
    ],
  },
];

/** Países que o usuário listou e ainda não estão no catálogo (fase 2). */
export const countries = () => [...new Set(CATALOG.map((c) => c.continent))];
