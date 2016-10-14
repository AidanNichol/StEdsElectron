const electronPackager = require('electron-compile/lib/packager-cli');

var options = {
  dir: './',
  platform: 'darwin',
  arch: 'all',
  name: 'stedsBooking',
  asar: true,
  overwrite: true,
}

electronPackager(options, (error, appPath)=>{
  if(error){
    console.error('Error!!', error);
    throw error;
  }
  console.log('Success! see '+appPath)
})
