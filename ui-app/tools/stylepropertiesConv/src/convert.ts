const props = require("../../../../ui-app/client/dist/styleProperties/Dropdown copy.json");

const enums = [
  ["designType", ["_default", "_outlined", "_filled", "_bigDesign1", "_text"]],
  [
    "colorScheme",
    ["_primary", "_secondary", "_tertiary", "_quaternary", "_quinary"],
  ],
];
const namePrefix = "dropdown";

const stylePrefix = ".comp.compDropdown";

const varSuffixs = enums.map(([enumName]) => `<${enumName}>`);

const processed: Map<
  string,
  {
    gn?: string;
    n?: string;
    cp: string;
    sel: string;
    dv?: string;
    np: boolean;
    spv?: { [_: string]: string };
    dn?: string;
  }
> = new Map();

const nonsel: any[] = [];

for (const prop of props) {
  if (!prop.sel || !prop.cp) {
    nonsel.push(prop);
    continue;
  }

  let key = prop.sel.trim();
  const vals = [];

  for (const [enumCat, values] of enums) {
    let foundVal = "";

    for (const enumVal of values) {
      if (key.includes("." + enumVal)) {
        foundVal = enumVal;
        key = key.replaceAll("." + enumVal, `<${enumCat}>`);
        break;
      }
    }

    vals.push(foundVal);
  }

  let obj = processed.get(`${prop.cp}-${key}`);

  if (obj === undefined) {
    if (!prop.np) {
      key = `${stylePrefix}${varSuffixs.join("")} ${key}`;
    }
    obj = { cp: prop.cp, sel: key, np: true, spv: {} };
    processed.set(`${prop.cp}-${key}`, obj);
  }

  obj.spv![vals.join("-")] = prop.dv;
}

const bigName = (str: string | undefined) => {
  if (!str) return undefined;
  return str
    .split("-")
    .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
    .join(" ");
};

const variableName = (str: string | undefined, sel: string) => {
  if (!str) return undefined;

  str = str.replace(/ /g, "");

  return namePrefix + str + varSuffixs.join("");
};

const displayName = (cp: string, sel: string) => {
  if (!cp) return undefined;
  cp = cp
    .split("-")
    .map((e) => e[0].toUpperCase() + e.slice(1))
    .join("");
  const ind = sel.lastIndexOf(".");

  if (ind !== -1) {
    let lastSel = sel.slice(ind + 1).trim();
    if (!lastSel.toLowerCase().startsWith("comp")) {
      lastSel = lastSel.replace(/[^a-z0-9A-Z]/g, "");
      lastSel = lastSel.charAt(0).toUpperCase() + lastSel.slice(1);
      cp += " " + lastSel;
    }
  }

  if (sel.includes("hasValue")) cp += " Value";

  if (sel.includes("isActive")) cp += " Active";

  if (sel.includes("hasError")) cp += " Error";

  if (sel.includes("hasSuccess")) cp += " Success";

  return cp;
};

const putAllEnums = (str: string) => {
  const notThere = varSuffixs.filter((suffix) => !str.includes(suffix));
  if (notThere.length === 0 || notThere.length === varSuffixs.length)
    return str;

  const startIndex = str.indexOf("<");
  const endIndex = str.indexOf(">", startIndex);
  const oneVar = str.slice(startIndex, endIndex + 1);
  return str.replace(new RegExp(oneVar, "g"), oneVar + notThere.join(""));
};

const pArray = Array.from(processed.values()).map((e) => {
  e.gn = bigName(e.cp);
  e.dn = displayName(e.cp, e.sel);
  e.n = variableName(e.dn, e.sel);
  e.sel = putAllEnums(e.sel);

  return e;
});

const uniqueCombos = enums.reduce((acc, [_, values]) => acc * values.length, 1);

for (const prop of pArray) {
  const spvValues = Object.entries(prop.spv!).filter(
    ([_, val]) => val !== undefined
  );

  if (spvValues.length === 0 && prop.spv) delete prop["spv"];

  if (spvValues.length == 1) {
    const dv = prop.spv![varSuffixs.map((e) => "").join("-")];
    if (dv) {
      prop.dv = dv;
      delete prop["spv"];
      continue;
    }
  }

  if (spvValues.length !== uniqueCombos) continue;

  const groupValues = spvValues.reduce((acc, [key, val]) => {
    if (!val) return acc;
    if (!acc[val]) acc[val] = [];
    acc[val].push(key);
    return acc;
  }, {} as { [key: string]: string[] });

  const keySet = Object.entries(groupValues).sort(
    (a, b) => b[1].length - a[1].length
  )?.[0];

  if ((keySet?.[1].length ?? 0) < 3) continue;

  keySet[1].forEach((each) => delete prop.spv![each]);
  prop.dv = keySet[0];
}

pArray.sort((a, b) => a.sel.localeCompare(b.sel));

console.log(JSON.stringify(pArray, null, 2));
console.log(`Total : ${pArray.length}`);

console.log("Non-selected", nonsel);
