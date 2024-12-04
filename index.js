const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const mediaserver = require('mediaserver');
const multer = require('multer');

// Настройки multer для загрузки файлов
const optionsMulter = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, path.join(__dirname, 'songs'));
    },
    filename: function (req, file, next) {
        next(null, file.originalname);
    }
});

const upload = multer({ storage: optionsMulter });
const archiveSongsPath = path.join(__dirname, 'songs.json');

// Статические файлы
app.use(express.static('public'));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

// Главная страница
app.get('/', function (req, res) {
        let updatedSongs = [];

        // Чтение директории с песнями
        fs.readdir(path.join(__dirname, 'songs'), function (err, files) {
            if (err) {
                return res.status(500).send('Ошибка чтения директории');
            }

            // Фильтрация файлов по расширению
            files.forEach(file => {
                if (/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(file)) {
                    updatedSongs.push({ "title": file });
                }
            });

            // Запись обновленного списка песен в файл
            fs.writeFile(archiveSongsPath, JSON.stringify(updatedSongs), function (error) {
                if (error) {
                    return console.log('Ошибка записи файла:', error);
                }
                console.log("Файл успешно записан");
                
                res.sendFile(path.join(__dirname, 'index.html'));
            });
        });
    });


// Эндпоинт для получения списка песен
app.get('/songs', function (req, res) {
    fs.readFile(archiveSongsPath, 'utf8', function (err, archive) {
        if (err) {
            return res.status(500).send('Ошибка чтения файла песен');
        }

        let songs = JSON.parse(archive);
        let updatedSongs = [];

        // Чтение директории с песнями
        fs.readdir(path.join(__dirname, 'songs'), function (err, files) {
            if (err) {
                return res.status(500).send('Ошибка чтения директории');
            }

            // Проверка наличия песен
            files.forEach(file => {
                const songTitle = file;
                const songExists = songs.find(song => song.title === songTitle);
                
                if (songExists) {
                    updatedSongs.push(songExists);
                } else {
                    if (/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(file)) {
                        updatedSongs.push({ title: songTitle });
                    }
                }
            });

            // Запись обновленного списка песен
            fs.writeFile(archiveSongsPath, JSON.stringify(updatedSongs), function (error) {
                if (error) {
                    return console.log(error);
                }
                console.log("Файл успешно записан");
            });

            res.json(updatedSongs);
        });
    });
});

// Эндпоинт для потокового воспроизведения песни
app.get('/songs/:title', function (req, res) {
    const song = path.join(__dirname, 'songs', req.params.title);
    mediaserver.pipe(req, res, song);
});

// Эндпоинт для загрузки новой песни
app.post('/songs', upload.single('song'), function (req, res) {
    const title = req.file.originalname;

    fs.readFile(archiveSongsPath, 'utf8', function (err, archive) {
        if (err) throw err;

        const songs = JSON.parse(archive);
        songs.push({ title: title });

        fs.writeFile(archiveSongsPath, JSON.stringify(songs), function (err) {
            if (err) throw err;
            res.sendFile(path.join(__dirname, 'index.html'));
        });
    });
});

// Запуск сервера
app.listen(3000);