var svgstore = require('svgstore');
var fs = require('fs');
// const dir = __dirname+'/src/svgs';
// console.log('dir', __dirname, dir);
// fs.readdir(dir, (err,data)=>{
//   console.log('data', data);
//   var sprites = data .filter((file)=>file.substr(-4)==='.svg')
//   .reduce(
//     (val, file)=>{
//       const name = file.substr(0,file.length-4);
//       return val.add(name, fs.readFileSync(`${dir}/${file}`, 'utf8'));
//     },
//     svgstore({
//       symbolAttrs: {
//         viewbox: '0,0,100,100'}
//       })
//   );
//   fs.writeFileSync('./sprites.svg', sprites);
// });
//
var sprites = svgstore({viewbox: "0 0 100 100"})
    .add('cloud', fs.readFileSync('/www/sites/StedsElectron/src/svgs/cloud.svg', 'utf8'))
    .add('cloud-up', fs.readFileSync('/www/sites/StedsElectron/src/svgs/cloud-up.svg', 'utf8'))
    .add('cloud-down', fs.readFileSync('/www/sites/StedsElectron/src/svgs/cloud-down.svg', 'utf8'))
    .add('Printer', fs.readFileSync('/www/sites/StedsElectron/src/svgs/Printer.svg', 'utf8'));

fs.writeFileSync('./sprites.svg', sprites);
