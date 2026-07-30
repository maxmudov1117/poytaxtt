const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
  <select id="fromRegion">
    <option value="">Qayerdan (Viloyat)</option>
    <option value="toshkent" selected>Toshkent</option>
  </select>
  <select id="fromDistrict">
    <option value="">Tuman tanlang</option>
    <option value="yunusobod" selected>Yunusobod</option>
  </select>
`);

const document = dom.window.document;
let fromRegionEl = document.getElementById("fromRegion");
let fromDistrictEl = document.getElementById("fromDistrict");

let fromRegionText = fromRegionEl.options[fromRegionEl.selectedIndex].text;
let fromDistrictText = fromDistrictEl.options[fromDistrictEl.selectedIndex].text;

console.log("Region Text:", fromRegionText);
console.log("District Text:", fromDistrictText);
