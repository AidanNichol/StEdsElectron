
const columns = [
    {width: 30, field: 'name',      title: 'Name',     align: 'L'},
    // {width: 0, field: 'memberStatus',   title: 'St' ,     align: 'L'},
    {width: 70, field: 'address',   title: 'Address' ,     align: 'L'},
    {width: 22, field: 'phone',     title: 'Phone'   ,     align: 'L'},
    {width: 10, field: 'memNo',     title: 'No'    ,     align: 'R'},
    {width: 55, field: 'email',     title: 'Email'   ,     align: 'L'},
    {width: 21, field: 'mobile',    title: 'Mobile'  ,     align: 'L'},
    {width: 50, field: 'nextOfKin', title: 'Next of Kin' ,     align: 'C'},
    {width: 25, field: 'medical',   title: 'Medical' ,     align: 'C'}];

const statusMap = {member: '', hlm: 'hlm', guest: 'gst',};
const members = [];
let fmtMem = {};
let data = members.map((mem)=>{
  fmtMem = {...mem,
    memNo: mem._id.substr(1),
    name: mem.lastName+", "+mem.firstName,
    memberStatus: statusMap[mem.memberStatus.tolowercase],
    address: mem.address.replace("\n", ", "),
  };
  return columns.map((col)=>fmtMem[col.field]||'');
});

const headers = columns.map((col)=>({text: col.title, style: 'tableHeader'}));

var dd = {
  pageSize: 'A4',

    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: 'landscape',

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [ 5, 27, 5, 0 ],

  footer: (currentPage, pageCount) =>{
    return {
        columns: [
          'date and time',
          { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' }
        ]
      };
   },
  header: ()=>(
     { text: 'St.Edwards Fellwalkers: Membership', style: 'header'}
  ),
	content: [
    {
      image: 'sampleImage.jpg', fit: [10,10]
    },
      // you can apply any logic and return any valid pdfmake element


				{
						style: 'tableExample',
						table: {
								widths: columns.map((col)=>col.width),
                headerRows: 1,
								body: [
                  headers,
                  data,
										[ 'fixed-width cells have exactly the specified width', { text: 'nothing interesting here', italics: true, color: 'gray' }, { text: 'nothing interesting here', italics: true, color: 'gray' }, { text: 'nothing interesting here', italics: true, color: 'gray' }]
								]
						}
				},
	],
	styles: {
		header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 10]
		},
		subheader: {
			fontSize: 16,
			bold: true,
			margin: [0, 10, 0, 5]
		},
		tableExample: {
			margin: [0, 5, 0, 15]
		},
		tableHeader: {
			bold: true,
			fontSize: 13,
			color: 'black'
		}
	},
	defaultStyle: {
		// alignment: 'justify'
	}

}
