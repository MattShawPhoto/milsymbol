//import { ms } from "../ms.js";
export function metadata(ms, metadata, mapping) {
  const version = this.options.sidc.substr(0, 2);
  //metadata.v13 = version > 13;
  const standardIdentity1 = this.options.sidc.substr(2, 1);
  const standardIdentity2 = this.options.sidc.substr(3, 1);
  const symbolSet = this.options.sidc.substr(4, 2);
  const status = this.options.sidc.substr(6, 1);
  const headquartersTaskForceDummy = this.options.sidc.substr(7, 1);
  const echelonMobility = this.options.sidc.substr(8, 2);
  const frameshape = this.options.sidc.substr(22, 1) || "0";

  const affiliationMapping = {
    0: "Unknown",
    1: "Unknown",
    2: "Friend",
    3: "Friend",
    4: "Neutral",
    5: "Hostile",
    6: "Hostile"
  };

  if (version == "10" || version == "11" || version == "12") {
    metadata.edition = "D";
  }
  if (version == "13" || version == "14") {
    metadata.edition = "E";
  }

  if (version == 13 && standardIdentity2 == 5) {
    metadata.suspect = true;
  }

  const dimensionMapping = {
    "00": "Sea",
    "01": "Air",
    "02": "Air",
    "05": "Air",
    "06": "Air",
    10: "Ground",
    11: "Ground",
    12: "Ground",
    15: "Ground",
    20: "Ground",
    30: "Sea",
    35: "Subsurface",
    36: "Subsurface",
    39: "Subsurface",
    40: "Ground",
    50: "Air",
    51: "Air",
    52: "Ground",
    53: "Sea",
    54: "Subsurface",
    60: "Ground"
  };

  const functionid = (metadata.functionid = this.options.sidc.substr(10, 10));
  metadata._modifier1 =
    (this.options.sidc.substr(20, 1) || "0") +
    (functionid.substr(6, 2) || "00");
  metadata._modifier2 =
    (this.options.sidc.substr(21, 1) || "0") +
    (functionid.substr(8, 2) || "00");

  metadata.context = mapping.context[parseInt(this.options.sidc.substr(2, 1))];
  metadata.affiliation = affiliationMapping[standardIdentity2];
  metadata.dimension = dimensionMapping[symbolSet] || "";

  // Not equipment symbolsets
  if (
    symbolSet == "10" ||
    symbolSet == "11" ||
    symbolSet == "25" ||
    symbolSet == "27" ||
    symbolSet == "40"
  )
    metadata.unit = true;

  //SymbolSets in Space
  if (symbolSet == "05" || symbolSet == "06" || symbolSet == "50")
    metadata.space = true;
  //SymbolSets that are Activities
  if (symbolSet == "40") metadata.activity = true;
  //SymbolSets that are landequipment
  if (symbolSet == "15") metadata.landequipment = true;
  //SymbolSets that are Installations
  if (symbolSet == "20") metadata.installation = true;
  //SymbolSets that are control-measure
  if (symbolSet == "25") metadata.controlMeasure = true;
  //SymbolSets in Cyberpace
  if (symbolSet == "60") metadata.cyberspace = true;
  //Sea Mines with MEDAL icn
  if (symbolSet == "36" && this.style.alternateMedal === false)
    metadata.fill = false;
  //Sea own track
  if (symbolSet == "30" && functionid.substr(0, 6) == 150000)
    metadata.frame = false;

  //Planned/Anticipated/Suspect symbols should have a dashed outline
  if (status == "1") metadata.notpresent = ms._dashArrays.anticipated;
  if (
    standardIdentity2 == "0" ||
    standardIdentity2 == "2" ||
    standardIdentity2 == "5"
  )
    metadata.notpresent = ms._dashArrays.pending;

  //All ETC/POSCON tracks shall have a pending standard identity frame.
  //All fused tracks shall have a pending standard identity frame.
  if (symbolSet == "30" && functionid.substr(0, 6) == 160000)
    metadata.notpresent = ms._dashArrays.pending;
  if (symbolSet == "35" && functionid.substr(0, 6) == 140000)
    metadata.notpresent = ms._dashArrays.pending;
  if (symbolSet == "35" && functionid.substr(0, 6) == 150000)
    metadata.notpresent = ms._dashArrays.pending;

  //Should it have a Condition Bar
  if (status == "2" || status == "3" || status == "4" || status == "5")
    metadata.condition = mapping.status[parseInt(status)];

  //First save the dimensionType and affiliationType before we modifies it...
  metadata.baseDimension = metadata.dimension;
  metadata.baseAffilation = metadata.affiliation;

  //Joker and faker should have the shape of friendly
  if (standardIdentity2 == "5" && standardIdentity1 == "1")
    metadata.joker = true;
  if (standardIdentity2 == "6" && standardIdentity1 == "1")
    metadata.faker = true;
  if (metadata.joker || metadata.faker) {
    metadata.affiliation = mapping.affiliation[1];
  }

  if (symbolSet == "00") metadata.dimensionUnknown = true;

  //If battle dimension is unknown, standard identity is Exersize and other than Unknown we should not have a symbol
  if (
    symbolSet == "00" &&
    standardIdentity1 == "1" &&
    metadata.affiliation != "Unknown"
  )
    metadata.affiliation = "";

  //Land Dismounted Individual should have special icons
  if (symbolSet == "27") {
    metadata.dimension = "LandDismountedIndividual";
    metadata.dismounted = true;
  }

  //Ground Equipment should have the same geometry as sea Friend...
  //Signal INTELLIGENCE Ground should have the same geometry as sea Friend...
  if (symbolSet == "15" || symbolSet == "52")
    metadata.dimension = mapping.dimension[2];

  //Civilian stuff
  if (
    (symbolSet == "01" && functionid.substring(0, 2) == "12") ||
    (symbolSet == "05" && functionid.substring(0, 2) == "12") ||
    symbolSet == "11" ||
    (symbolSet == "12" && functionid.substring(0, 2) == "12") ||
    (symbolSet == "15" && functionid.substring(0, 2) == "16") ||
    (symbolSet == "30" && functionid.substring(0, 2) == "14") ||
    (symbolSet == "35" && functionid.substring(0, 2) == "12")
  ) {
    metadata.civilian = true;
  }

  // Frame shape overrides 2525E
  if (frameshape != "0") {
    metadata.civilian = false;
    metadata.cyberspace = false;
    metadata.installation = false;
    metadata.landequipment = false;
    metadata.activity = false;
    metadata.space = false;
    metadata.unit = false;
    metadata.cyberspace = false;
    switch (frameshape) {
      case "1": // Space
        metadata.dimension = "Air";
        metadata.space = true;
        break;
      case "2": // Air
        metadata.dimension = "Air";
        break;
      case "3": // Land Unit
        metadata.dimension = "Ground";
        metadata.unit = true;
        break;
      case "4": // Land Equipment/Sea Surface
        metadata.dimension = "Sea";
        metadata.landequipment = true;
        break;
      case "5": // Land Installation
        metadata.dimension = "Ground";
        metadata.installation = true;
        break;
      case "6": // Dismounted Individuals
        metadata.dimension = "LandDismountedIndividual";
        metadata.dismounted = true;
        break;
      case "7": // Sea Subsurface
        metadata.dimension = "Subsurface";
        break;
      case "8": // Activity/Event
        metadata.dimension = "Ground";
        metadata.activity = true;
        metadata.unit = true;
        break;
      case "9": // Cyberspace
        metadata.dimension = "Ground";
        metadata.cyberspace = false;
        metadata.unit = true;
        break;
    }
  }
  if (frameshape == "A") metadata.frame = false;

  //Setting up Headquarters/task force/dummy
  if (["1", "3", "5", "7"].indexOf(headquartersTaskForceDummy) > -1)
    metadata.feintDummy = true;
  if (["2", "3", "6", "7"].indexOf(headquartersTaskForceDummy) > -1)
    metadata.headquarters = true;
  if (["4", "5", "6", "7"].indexOf(headquartersTaskForceDummy) > -1)
    metadata.taskForce = true;

  //Setting up Echelon/Mobility/Towed Array Amplifier
  if (echelonMobility <= 30) {
    metadata.echelon = mapping.echelonMobility[echelonMobility];
  }
  if (echelonMobility >= 30 && echelonMobility < 70) {
    metadata.mobility = mapping.echelonMobility[echelonMobility];
  }
  if (echelonMobility >= 70 && echelonMobility < 80) {
    metadata.leadership = mapping.echelonMobility[echelonMobility];
  }

  return metadata;
}
