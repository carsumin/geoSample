// overlay
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
// layer 선언
let vectorLayer_node = '';
let vectorLayer_link = '';
let vectorLayer_cmm_dsrclink = '';

document.addEventListener('DOMContentLoaded', function() {
    
    // feature 팝업을 위한 overlay 객체 생성
    const overlay = new ol.Overlay ({
        element : container,
        autoPan : {
            animation : {
                duration : 250,
            },
        },
    });
    
    // OpenLayers 맵객체 생성
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM() // 배경지도 : openlayers 기본 OSM 사용
            })
        ],
        overlays: [overlay],
        view: new ol.View({
            center: ol.proj.fromLonLat([128.1170, 36.1391]), // 4326 -> 3857
            zoom: 10
        })
    });

    // 클릭해서 feature 데이터 가져와서 overlay 팝업으로 띄우기
    // ** geometry type에 따라 분류 필요
    map.on('singleclick', (evt) =>
    {
        // 클릭이벤트의 좌표
        const coordinate = evt.coordinate;

        let value = '';
        let type = '';

        // 특정 픽셀에 feature가 있는지 여부 확인
        if(map.hasFeatureAtPixel(evt.pixel))
        {
            map.forEachFeatureAtPixel(evt.pixel, feature =>
                {
                    type = feature.getGeometry().getType();
                    
                    switch (type) {
                        case 'Point' :
                            value = feature.getProperties().r_name;
                            break;
                        case 'MultiLineString' :
                            value = feature.getProperties().r_name;                          
                            break;
                        case 'MultiPolygon' :
                            value = feature.getProperties().DSRC_SECT_;
                            break;
                }
                
            });
        }
        
        content.innerHTML = '<p style="font-weight: bold;">클릭한 좌표 :</p><code>' + coordinate + '</code>'
                          + '<p style="font-weight: bold;">properties :</p><code>' + value + '</code>';

        // overlay 팝업을 클릭한 부분에 띄우기
        overlay.setPosition(coordinate);
    })

    // overlay 팝업 닫기
    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    }

    // Style 지정
    const styles = {
        'Point' : [
            new ol.style.Style({
                image : new ol.style.Circle({
                    radius : 10,
                    fill : new ol.style.Fill({ 
                        color : '#00FF7F' 
                    }),
                    stroke : new ol.style.Stroke({
                        color : '#006400',
                        width : 3 
                    })
                })
            })
        ],
        'MultiLineString' : [
            new ol.style.Style({
                stroke : new ol.style.Stroke({
                    color : '#FF4500',
                    width : 5
                })
            })
        ],
        'MultiPolygon' : [
            new ol.style.Style({
                stroke : new ol.style.Stroke({
                    color : '#FF1493',
                    width : 3
                }),
                fill : new ol.style.Fill({
                    color : '#FFDAB9'
                })
            })
        ]
    };

    // Style 적용
    const styleFunction = function(feature){
        return styles[feature.getGeometry().getType()];
    };

    // fetch API 사용해서 geojson 읽어오기.. 또 CORS 에러.. 가능하면 이게 가독성이 좋은듯..
    // fetch('geoJSON/node_sample.geojson', { mode : 'no-cors' })
    //     .then(response => response.json())
    //     .then(geojsonData => {
    //         const vectorSource_node = new ol.source.Vector({
    //             features: new ol.format.GeoJSON().readFeatures(geojsonData, {
    //                 featureProjection: 'EPSG:3857'        
    //             })
    //         })
    //     });

    // Vector 레이어 만들기 위한 공통함수
    function createVectorLayer(geoJsonObject, styleFunction) {
        const vectorSource = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(geoJsonObject, {
                featureProjection: 'EPSG:3857'
            })
        });

        return new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
        });
    }

    vectorLayer_node = createVectorLayer(nodeObject, styleFunction);
    vectorLayer_link = createVectorLayer(linkObject, styleFunction);
    vectorLayer_cmm_dsrclink = createVectorLayer(cmm_dsrclinkObject, styleFunction)


    // 맵에 Layer 추가
    map.addLayer(vectorLayer_node);
    map.addLayer(vectorLayer_link);
    map.addLayer(vectorLayer_cmm_dsrclink);
  
    
});


/** Layer ON/OFF 함수 */
function fnNodeLayer(){
    if(vectorLayer_node.getVisible()){
        vectorLayer_node.setVisible(false);
    }else{
        vectorLayer_node.setVisible(true);
    }
};

function fnLinkLayer(){
    if(vectorLayer_link.getVisible()){
        vectorLayer_link.setVisible(false);
    }else{
        vectorLayer_link.setVisible(true);
    }
};

function fnDsrclinkLayer(){
    if(vectorLayer_cmm_dsrclink.getVisible()){
        vectorLayer_cmm_dsrclink.setVisible(false);
    }else{
        vectorLayer_cmm_dsrclink.setVisible(true);
    }
};