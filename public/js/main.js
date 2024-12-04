$(function() {
    const audio = $('audio');

    // Загружает список песен и обновляет интерфейс
    function loadSongs() {
        $.ajax({
            url: '/songs'
        }).done(function(songs) {
            updateSongList(songs);
        }).fail(function() {
            alert('Unable to load songs');
        });
    }

    // Обновляет список песен на странице
    function updateSongList(songs) {
        const list = $('.song-list');
        list.empty(); // Очищает предыдущий список

        songs.forEach(function(song) {
            const listItem = createSongListItem(song);
            listItem.appendTo(list);
        });
    }

    // Создает элемент списка для каждой песни
    function createSongListItem(song) {
        const listItem = $('<li class="song">' + song.title + '</li>');
        listItem.on('click', song, play);
        return listItem;
    }

    // Проигрывает выбранную песню
    function play(event) {
        audio[0].pause(); // Сначала останавливаем текущую песню
        audioMotion.stop(); // Останавливаем визуализацию

        const songSrc = '/songs/' + event.data.title;
        audio.attr('src', songSrc); // Устанавливаем источник новой песни
        audio[0].load(); // Загружаем песню
        audio[0].play(); // Проигрываем новую песню
        audioMotion.start(); // Запускаем визуализацию
    }

    // Инициализация визуализации звука
    const audioMotion = new AudioMotionAnalyzer(
        $('#visualizer')[0],
        {
            source: audio[0],
            height: 800,
            width: 1000,
            overlay: true,
            showBgColor: true,
            showScaleX: false
        }
    );

    // Загружаем список песен при загрузке страницы
    loadSongs();
});