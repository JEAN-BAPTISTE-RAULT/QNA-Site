(function (Drupal) {
  'use strict';

  const MAP_CONFIG = {
    lat: 46.5,
    lng: 2.5,
    zoom: 5,
  };

  // Pins en dur — à remplacer par des données dynamiques
  const PINS = [
    { lat: 48.8566, lng:  2.3522, title: 'Paris',        url: '/paris' },
    { lat: 43.2965, lng:  5.3698, title: 'Marseille',    url: '/marseille' },
    { lat: 45.7640, lng:  4.8357, title: 'Lyon',         url: '/lyon' },
    { lat: 43.6047, lng:  1.4442, title: 'Toulouse',     url: '/toulouse' },
    { lat: 44.8378, lng: -0.5792, title: 'Bordeaux',     url: '/bordeaux' },
    { lat: 47.2184, lng: -1.5536, title: 'Nantes',       url: '/nantes' },
    { lat: 43.7102, lng:  7.2620, title: 'Nice',         url: '/nice' },
    { lat: 48.5734, lng:  7.7521, title: 'Strasbourg',   url: '/strasbourg' },
    { lat: 50.6292, lng:  3.0573, title: 'Lille',        url: '/lille' },
    { lat: 45.1885, lng:  5.7245, title: 'Grenoble',     url: '/grenoble' },
    { lat: 49.4431, lng:  1.0993, title: 'Rouen',        url: '/rouen' },
    { lat: 47.3220, lng:  5.0415, title: 'Dijon',        url: '/dijon' },
  ];

  window.initMap = function () {
    const mapEl = document.getElementById('qna-gmap');
    if (!mapEl) return;

    const map = new google.maps.Map(mapEl, {
      center: { lat: MAP_CONFIG.lat, lng: MAP_CONFIG.lng },
      zoom: MAP_CONFIG.zoom,
      disableDefaultUI: true,
      styles: [
        { elementType: 'geometry', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels',   stylers: [{ visibility: 'off' }] },
        { featureType: 'water',     elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#c8e9f9' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#f7f7f7' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ visibility: 'on' }, { color: '#aaaaaa' }, { weight: 1 }] },
        { featureType: 'administrative.country', elementType: 'labels.text',      stylers: [{ visibility: 'on' }] },
        { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
      ],
    });

    // Chargement de MarkerClusterer après Google Maps
    const clustererScript = document.createElement('script');
    clustererScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
    clustererScript.onload = function () {
      const markers = PINS.map(({ lat, lng, title, url }) => {
        const marker = new google.maps.Marker({
          position: { lat, lng },
          title,
        });
        marker.addListener('click', () => {
          window.location.href = url;
        });
        return marker;
      });

      new markerClusterer.MarkerClusterer({ map, markers });
    };
    document.head.appendChild(clustererScript);
  };

  Drupal.behaviors.qnaGMap = {
    attach: function (context) {
      const mapEl = (context === document ? document : context).querySelector('#qna-gmap');
      if (!mapEl) return;

      if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBrnB87kAoWk6kvUVIe-INmgy6Ifu09OuM&callback=initMap';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    },
  };
})(Drupal);
