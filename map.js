mapboxgl.accessToken = 'pk.eyJ1IjoidG1jdyIsImEiOiJja2YzMmc3YnkxbWhzMzJudXk2c2x3MTVhIn0.XZpElz19TDemsBc0yvkRPw';

let data = {};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tmcw/ckux78is81bnd17lqquvp55lg',
  center: [0, 0],
  zoom: 1
});

map.once('load', () => {
  fetch('./data.json').then(d => d.json())
    .then(_data => {
      data = data;
      addSources();
    });
});

function addSources() {
  map.addSource("gadm0", {
    type: "geojson",
    data: "./gadm36_0_joined.json",
  });

  map.addSource("gadm1", {
    type: "geojson",
    data: "./gadm36_1.json",
  });

  map.addLayer(
    {
      id: "gadm0",
      type: "fill",
      source: "gadm0",
      paint: {
        'fill-color': [
          'step',
          ['get', 'Total C Yr-2013 (TgC)'],
          '#fef6b5',
          0,
          '#fef6b5',
          150,
          '#ffdd9a',
          300,
          '#ffc285',
          450,
          '#ffa679',
          600,
          '#fa8a76',
          750,
          '#f16d7a',
          1000,
          '#e15383'
        ],
        "fill-opacity": 0.8,
      },
    },
    "admin-1-boundary-bg"
  );

  // map.addLayer(
  //   {
  //     id: "gadm1",
  //     type: "fill",
  //     source: "gadm1",
  //     paint: {
  //       "fill-color": "#eee",
  //       "fill-opacity": [
  //         "interpolate",
  //         ["linear"],
  //         ["zoom"],
  //         4.5,
  //         0.8,
  //         5,
  //         0.1,
  //       ],
  //     },
  //   },
  //   "admin-1-boundary-bg"
  // );
}
