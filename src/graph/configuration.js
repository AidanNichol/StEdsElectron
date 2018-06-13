const config = {
  layout: 'dot',
  nodeColor: '#0000ff',
  edgeColor: '#101010',
  noDependencyColor: '#006400',
  backgroundColor: '#ffffff',
  cyclicNodeColor: '#ff0000',
  graphVizOptions: {
    G: {
      labelloc: 't',
      labeljust: 'r',
      fontsize: 24,
    },
    N: { style: 'filled', fillcolor: '#c0c0c0' },
  },
  requireConfig: {
    // baseUrl: '/src',
    paths: {
      components: '/src/components',
      reports: '../reports',
    },
  },
};
module.exports = config;
