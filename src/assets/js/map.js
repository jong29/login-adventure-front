
import serviceKey from "./key.js";
// 카카오지도
var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.500613, 127.036431), // 지도의 중심좌표
    level: 13, // 지도의 확대 레벨
  };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);
var clusterer = new kakao.maps.MarkerClusterer({
    map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
    averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
    minLevel: 10 // 클러스터 할 최소 지도 레벨 
});
// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// 검색 버튼을 누르면..
// 지역, 유형, 검색어 얻기.
// 위 데이터를 가지고 공공데이터에 요청.
// 받은 데이터를 이용하여 화면 구성.
document.getElementById("sido").addEventListener("change", () => {
    fetchPlace();
});
document.getElementById("gugun").addEventListener("change", () => {
  fetchPlace();
});
let filters=[];
document.querySelectorAll(".filterIcon").forEach($btn => {
  $btn.onclick = ()=> {
      $btn.classList.toggle("clicked");
      if($btn.classList.contains("clicked")){
        filters.push($btn.value);
        fetchPlaceByContentTypeId()
      }else {
        filters=filters.filter((filter)=>filter!=$btn.value);
        fetchPlaceByContentTypeId()
      }
 

  }
});
let positions; // marker 배열.
export function fetchPlaceByContentTypeId(){
  if(filters.length==0){
    if(!document.getElementById("sido").value){
      fetchInit();
    }else{
      fetchPlace(sido);
    }
    return;
  }
  positions=[];
  let processed=0;
  if(filters.length==7){
    fetchPlace();
    return;
  }
  filters.forEach((filter,index)=>{
    let baseUrl = `https://apis.data.go.kr/B551011/KorService1/`;
    let queryString = `serviceKey=${serviceKey}&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;
    let areaCode = document.getElementById("sido").value;
    let sigunguCode = document.getElementById("gugun")?.value;
    if(areaCode){
      map.setLevel(10);
    }
    let keyword = '';
    if (parseInt(areaCode)) queryString += `&areaCode=${areaCode}`;
    
    queryString += `&contentTypeId=${filter}`;
    
    let service = ``;
    if (sigunguCode ){
      queryString += `&sigunguCode=${sigunguCode}`;
    }
    if (keyword) {
      service = `searchKeyword1`;
      queryString += `&keyword=${keyword}`;
    } else {
      service = `areaBasedList1`;
    }
    let searchUrl = baseUrl + service + "?" + queryString;
    fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => {
     
      let trips = data.response.body.items.item;
      trips?.forEach(({ title, firstimage, firstimage2, addr1, addr2, mapy, mapx, tel, zipcode }) => {
        let markerInfo = {
          title,
          firstimage,
          firstimage2,
          latlng: new kakao.maps.LatLng(mapy, mapx),
          addr1,
          addr2,
          tel,
          zipcode
        };
        positions.push(markerInfo);
      });
      processed++;
      if(processed==(filters.length)){
        displayMarker();
      }
    });
  });
  
  

}

export function fetchPlace(){
    let baseUrl = `https://apis.data.go.kr/B551011/KorService1/`;
  // let searchUrl = `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;
  // let searchUrl = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;

  let queryString = `serviceKey=${serviceKey}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;
  let areaCode = document.getElementById("sido").value;
  let sigunguCode = document.getElementById("gugun")?.value;
  if(areaCode){
    map.setLevel(11);
  }
  //let contentTypeId = document.getElementById("search-content-id").value;
  let keyword = '';
  if (areaCode && parseInt(areaCode)) queryString += `&areaCode=${areaCode}`;
  //if (parseInt(contentTypeId)) queryString += `&contentTypeId=${contentTypeId}`;
  // if (!keyword) {
  //   alert("검색어 입력 필수!!!");
  //   return;
  // } else searchUrl += `&keyword=${keyword}`;
  if (sigunguCode ){
    queryString += `&sigunguCode=${sigunguCode}`;
  }
  let service = ``;
  if (keyword) {
    service = `searchKeyword1`;
    queryString += `&keyword=${keyword}`;
  } else {
    service = `areaBasedList1`;
  }
  let searchUrl = baseUrl + service + "?" + queryString;

  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => makeList(data));
}



function makeList(data) {
  //document.querySelector("table").setAttribute("style", "display: ;");
  let trips = data.response.body.items.item;
  
  positions = [];
  trips?.forEach(({ title, firstimage, firstimage2, addr1, addr2, mapy, mapx, tel, zipcode }) => {
    let markerInfo = {
      title,
      firstimage,
      firstimage2,
      latlng: new kakao.maps.LatLng(mapy, mapx),
      addr1,
      addr2,
      tel,
      zipcode
    };
    positions.push(markerInfo);
  });
  
  //document.getElementById("trip-list").innerHTML = tripList;
  displayMarker();

}

// 인포윈도우 여는 함수
function makeOverListener(map, marker, infowindow) {
  return function() {
      infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
  return function() {
      infowindow.close();
  };
}

let markers=[];
function displayMarker() {
  if(markers.length>0){
    clusterer.removeMarkers(markers);
    markers=[];
  }

  // 마커 이미지의 이미지 주소입니다
  var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
  for (var i = 0; i < positions.length; i++) {
    // 마커 이미지의 이미지 크기 입니다
    var imageSize = new kakao.maps.Size(24, 35);

    // 마커 이미지를 생성합니다
    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: positions[i].latlng, // 마커를 표시할 위치
      title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
      image: markerImage, // 마커 이미지
      clickable: true
    });
    markers.push(marker);
     // 마커 위에 커스텀오버레이를 표시합니다
    // 마커를 중심으로 커스텀 오버레이를 표시하기위해 CSS를 이용해 위치를 설정했습니다
   // 마커에 표시할 인포윈도우를 생성합니다 
   var content = `
    <div class="wrap">
      <div class="info">  
        <div class="title">
            ${positions[i].title}
          </div>
        <div class="body">
              <div class="img">
                  <img src=${positions[i].firstimage ?? positions[i].firstimage2 ?? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/thumnail.png"} width="73" height="70">
            </div>
              <div class="desc">
                <div class="ellipsis">${positions[i].addr1}</div>
                <div class="jibun ellipsis">${positions[i].addr2}</div>
                <div class="jibun ellipsis">(우) ${positions[i].zipcode} (tel) ${positions[i].tel}</div>
            </div>
        </div>
      </div>   
    </div>
    `;
 
   var infowindow = new kakao.maps.InfoWindow({
    content // 인포윈도우에 표시할 내용
   });
    
   // 마커에 이벤트 추가
   // mouseover: 정보창 표시
   // mouseout: 정보창 비표시
   kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
   kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));

  }
  clusterer.addMarkers(markers);
  // 첫번째 검색 정보를 이용하여 지도 중심을 이동 시킵니다
  if(map.getLevel()!=13){
  map.setCenter(positions[0].latlng);}
  
}

function moveCenter(lat, lng) {
  map.setCenter(new kakao.maps.LatLng(lat, lng));
}
function fetchInit(){
  map.setLevel(13);
  let baseUrl = `https://apis.data.go.kr/B551011/KorService1/`;
  // let searchUrl = `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;
  // let searchUrl = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;

  let queryString = `serviceKey=jKuaP%2FnFxe7%2ByvRe8h%2B7LHRX%2FG9hz15s5jvlF1AvlEgtj42HGR%2FJIs9ERPZGrU3TAykKDiagiJkXCi09eg%2BT7A%3D%3D&numOfRows=200&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=A`;
  let service =   `areaBasedList1`;
  let searchUrl = baseUrl + service + "?" + queryString;
  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => makeList(data));
}


fetchInit();