async function initMap() {
    const configRes = await fetch('/api/map-config');
    const config = await configRes.json();
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: config.zoom,
        center: { lat: config.lat, lng: config.lng },
        // ここからスタイル指定
        styles: [
            {
                "featureType": "all",
                "elementType": "labels",
                "stylers": [{ "visibility": "off" }] // すべてのラベル（駅名・建物名など）を消す
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{ "visibility": "off" }] // 店や公園などのアイコンを消す
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{ "visibility": "off" }] // 鉄道やバスを消す
            },
            {
                "featureType": "road",
                "elementType": "labels",
                "stylers": [{ "visibility": "off" }] // 通りの名前を消す
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{ "color": "#f5f5f5" }] // 背景をシンプルに
            }
        ]
    });

    // 共通の InfoWindow インスタンス（1つを使い回す）
    const infoWindow = new google.maps.InfoWindow();

    try {
        // 2. 地点一覧（座標と名前のみ）を取得
        const response = await fetch('/api/locations');
        let locations = await response.json();

        // libsql の結果形式 (rows) に対応
        if (locations.rows) locations = locations.rows;

        if (!locations || locations.length === 0) return;

        // 3. 各地点にピンを設置
        locations.forEach(loc => {
            const marker = new google.maps.Marker({
                position: { 
                    lat: parseFloat(loc.latitude), 
                    lng: parseFloat(loc.longitude) 
                },
                map: map,
                title: loc.groupName,
                // icon: { url: "/images/custom-pin.png", scaledSize: new google.maps.Size(40, 40) } // 画像を変えるならここ
            });

            // 4. ピンをクリックした時の挙動
            marker.addListener("click", async () => {
                // 読み込み表示
                infoWindow.setContent('<div style="color:black; padding:10px;">読み込み中...</div>');
                infoWindow.open(map, marker);

                try {
                    // IDに基づいて詳細（リーダー情報）を取得
                    const detailRes = await fetch(`/api/locations/${loc.id}`);
                    const leaders = await detailRes.json();

                    // HTMLの組み立て
                    // leaders.map の部分を差し替え
                    const leaderHtml = leaders.length > 0 
                        ? leaders.map(ldr => `
                            <div class="leader-item">
                                <img src="${ldr.imageUrl}" class="leader-img">
                                <div style="flex-grow: 1;">
                                    <div class="leader-name-row">
                                        <span class="leader-nickname">${ldr.nickname}</span>
                                        <span class="leader-trainer">:${ldr.trainerName}</span>
                                    </div>
                                    <div class="leader-comment">
                                        ${ldr.comment || "よろしくお願いします！"}
                                    </div>
                                </div>
                            </div>
                        `).join('')
                        : '<p class="no-data">リーダー情報はありません</p>';

                    infoWindow.setContent(`
                        <div class="info-container">
                            <h3 class="info-title">${loc.groupName}</h3>
                            ${leaderHtml}
                        </div>
                    `);
                } catch (err) {
                    console.error(err);
                    infoWindow.setContent('<div style="color:red;">データの取得に失敗しました</div>');
                }
            });
        });

    } catch (error) {
        console.error("Error loading locations:", error);
    }
}

// Google Maps API がグローバルにアクセスできるように window に紐付け
window.initMap = initMap;