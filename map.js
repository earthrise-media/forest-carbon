mapboxgl.accessToken = 'pk.eyJ1IjoidG1jdyIsImEiOiJja2YzMmc3YnkxbWhzMzJudXk2c2x3MTVhIn0.XZpElz19TDemsBc0yvkRPw';


const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tmcw/ckkpwot3j10mt17p1y4ecfvgx',
  center: [0, 0],
  zoom: 1
});

map.once('load', () => {
  Promise.all(['./meta_0.json', './meta_1.json'].map(url =>
    fetch(url).then(d => d.json())))
    .then(([meta0, meta1]) => {
      delete meta0['Nonforest Area (ha)']
      delete meta1['Nonforest Area (ha)']
      addSources({meta0, meta1});
    });
});

function addSources({meta0, meta1}) {
  map.addSource("gadm0", {
    type: "geojson",
    data: "./gadm36_0_joined.json",
  });

  map.addSource("gadm1", {
    type: "geojson",
    data: "./gadm36_1_joined.json",
  });

  map.addLayer(
    {
      id: "layer-0",
      type: "fill",
      source: "gadm0",
      paint: {
        'fill-color': [
          'step',
          ['get', 'Total C Yr-2013 (TgC)'],
          '#fef6b5',
          -1000000,
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
        "fill-opacity": [
          'case',
          ['has', 'Total C Yr-2013 (TgC)'],
          0.8,
          0
        ]
      },
    },
    "admin-1-boundary-bg"
  );

  map.addLayer(
    {
      id: "layer-1",
      type: "fill",
      source: "gadm1",
      layout: {
        visibility: 'none'
      },
      paint: {
        'fill-color': [
          'step',
          ['get', 'Total C Yr-2009 (GgC)'],
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
        "fill-opacity": [
          'case',
          ['has', 'Total C Yr-2013 (TgC)'],
          0.8,
          0
        ],
      },
    },
    "admin-1-boundary-bg"
  );

  let level = 0;
  let currentIndicator = null;
  let currentYear = null;
  let currentFullIndicator = null;

  function setSelect(meta) {
    indicator.innerHTML = '';
    const keys = [...new Set(Object.keys(meta).map(key => {
      return key.replace(/Yr\-.*/, '').trim();
    }))].sort();
    for (let field of keys) {
      const option = indicator.appendChild(document.createElement('option'))
      option.value = field;
      option.textContent = field;
    }
    currentIndicator = keys[0];
  }

  function setYears(meta) {
    const years = [...new Set(Object.keys(meta).map(key => {
      const match = key.match(/Yr\-(\d{4})/)
      return +match[1]
    }))];

    year.setAttribute('min', Math.min(...years));
    year.setAttribute('max', Math.max(...years));
    year.value = Math.min(...years)
    currentYear = Math.min(...years);
  }

  function switchLevel() {
    switch (level) {
      case 0:
        setSelect(meta0);
        setYears(meta0);
        break;
      case 1:
        setSelect(meta1);
        setYears(meta1);
        break;
    }
  }

  function findFullName(prefix, meta) {
    return Object.keys(meta).find(key => {
      return key.startsWith(prefix);
    })
  }

  function updateMap() {
    const meta = level === 0 ? meta0 : meta1;
    const range = meta[currentFullIndicator];
    map.setLayoutProperty(`layer-${level}`, 'visibility', 'visible');
    map.setLayoutProperty(`layer-${level === 0 ? 1 : 0}`, 'visibility', 'none');
    map.setPaintProperty(`layer-${level}`, 'fill-color',
      [
        'interpolate',
        // Set the exponential rate of change to 0.5
        ['linear'],
        ['get', currentFullIndicator],
        // When zoom is 15, buildings will be beige.
        range.min,
        '#fef6b5',
        // When zoom is 18 or higher, buildings will be yellow.
        range.max,
        '#e15383'
      ]
    );
    map.setPaintProperty(`layer-${level}`, 'fill-opacity',
      [
        'case',
        ['has', currentFullIndicator],
        0.8,
        0
      ]
    );
  }

  const popup = new mapboxgl.Popup({
    closeButton: false
  })

  map.on('mousemove', e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [`layer-${level}`]
    })


    if (features.length) {
      const p = features[0].properties
      const val = p[currentFullIndicator]
      if (val == undefined) {
        popup.remove();
        return;
      }
      console.log(getIndicatorValues(p))
      popup.addTo(map)
      popup.setLngLat(e.lngLat)
      const elem = document.createElement('div')
      elem.innerHTML = `<h4>${p.Country}
        ${p.Province ? `/ ${p.Province}` : ''}
      </h4>
      <div class='text-2xl font-semibold flex items-center gap-x-1'>
      <span id='sparkline'></span>
      ${val.toFixed(2)}</div>
      <div><span class=''>${currentFullIndicator}</span></div>`;
      elem.querySelector('#sparkline').appendChild(sparkline(getIndicatorValues(p)))
      popup.setDOMContent(elem)
    } else {
      popup.remove();
    }

  })

  function updateIndicator() {
    const meta = level === 0 ? meta0 : meta1;
    currentFullIndicator = findFullName(`${currentIndicator} Yr-${currentYear}`, meta)
  }

  function getIndicatorValues(p) {
    return Object.entries(p).filter(([key]) => {
      return key.startsWith(currentIndicator)
    }).map(([key, value]) => {
      return [+key.match(/(\d{4})/)[1], value];
    }).sort((a, b) => {
      return a[0] - b[0]
    })
  }

  function sparkline(values) {
    const c = document.createElement('canvas');
    c.width = 80;
    c.height = 40;
    const ctx = c.getContext('2d')
    const minx = Math.min(...values.map(v => v[0]))
    const maxx = Math.max(...values.map(v => v[0]))
    const min = Math.min(...values.map(v => v[1]))
    const max = Math.max(...values.map(v => v[1]))
    function scalex(x) {
      return ((x - minx) / (maxx - minx)) * 80;
    }
    function scale(x) {
      return ((x - min) / (max - min)) * 40;
    }
    ctx.moveTo(scalex(values[0][0]), 40 - scale(values[0][1]))
    for (let item of values) {
      ctx.lineTo(scalex(item[0]), 40 - scale(item[1]))
    }
    c.style = 'width: 40px;height:20px;';
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2;
    ctx.stroke();
    return c;
  }

  indicator.onchange = (e) => {
    currentIndicator = e.target.value;
    updateIndicator();
    updateMap();
  }

  year.oninput = (e) => {
    currentYear = e.target.value;
    updateIndicator();
    updateMap();
  }

  levels.onchange = (e) => {
    level = +e.target.value;
    updateIndicator();
    updateMap();
  }

  switchLevel();
  indicator.dispatchEvent(new CustomEvent('change'))
  updateMap();
}
