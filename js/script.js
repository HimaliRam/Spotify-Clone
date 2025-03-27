console.log("Let's write Javascript");
let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;

    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    //   console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let songname = decodeURIComponent(element.href.split(`${folder}/`).pop());
            songs.push(songname)
        }

    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Himali</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    //play The First Song
    //Attach as event listner to all song 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    //    let audio = new Audio("/songs/" + track);
    currentSong.src = `${currfolder}/${track}`;
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let arr = Array.from(anchors)
    for (let index = 0; index < arr.length; index++) {
        const e = arr[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]


            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder=${folder} class="card">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                                <!-- Green Circle Background -->
                                <circle cx="12" cy="12" r="11" fill="#1fdf64" />
                                <!-- Larger Solid Black Play Icon -->
                                <path d="M9 5 L20 12 L9 19 Z" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`

        }
    }
    //Load the playlist  whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {

        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
    // console.log(anchors)  
}


async function main() {


    //Get The List Of All Songs
    await getsongs("/songs/Bollywood")
    // console.log(songs)
    playMusic(songs[0], true)

    //Display all the album in the page 
    displayAlbums()



    //Attach as event listner to play next and previouse
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an Event listner to query Selector
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add an Eventlistner for hemburger
    document.querySelector(".hemburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an Eventlistner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    //add an Event Listner for previous
    previous.addEventListener("click", () => {
        console.log("Previous Clicked!")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add an Event Listner for next
    next.addEventListener("click", () => {
        console.log("Next Clicked!")


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an Event to Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        // console.log("setting volume to",e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volu>img").src = document.querySelector(".volu>img").src.replace("mute.svg", "volume.svg")
        }
    })

    document.addEventListener("keydown", (event) => {
        // Prevent default action for spacebar (which normally scrolls the page)
        if (event.code === "Space") {
            event.preventDefault();
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        }
        else if (event.code === "ArrowUp") {
            // Increase volume by 10%
            currentSong.volume = Math.min(1, currentSong.volume + 0.1);
            document.querySelector(".range input").value = currentSong.volume * 100;
            if (currentSong.volume > 0) {
                document.querySelector(".volu>img").src = "img/volume.svg";
            }
        } else if (event.code === "ArrowDown") {
            // Decrease volume by 10%
            currentSong.volume = Math.max(0, currentSong.volume - 0.1);
            document.querySelector(".range input").value = currentSong.volume * 100;
            if (currentSong.volume === 0) {
                document.querySelector(".volu>img").src = "img/mute.svg";
            }
        } else if (event.code === "ArrowRight") {
            // Play next song
            let index = songs.indexOf(currentSong.src.split("/").pop());
            if (index + 1 < songs.length) {
                playMusic(songs[index + 1]);
            }
        } else if (event.code === "ArrowLeft") {
            // Play previous song
            let index = songs.indexOf(currentSong.src.split("/").pop());
            if (index > 0) {
                playMusic(songs[index - 1]);
            }
        } else if (event.ctrlKey && event.code === "KeyM") {
            // Mute/unmute (toggle between 0% and 50%)
            if (currentSong.volume > 0) {
                currentSong.volume = 0;
                document.querySelector(".volu > img").src = document.querySelector(".volu > img").src.replace("volume.svg", "mute.svg");
            } else {
                currentSong.volume = 0.5;
                document.querySelector(".volu > img").src = document.querySelector(".volu > img").src.replace("mute.svg", "volume.svg");
            }
            document.querySelector(".range input").value = currentSong.volume * 100;
        }
    });

    //Addd event listner to mute track
    document.querySelector(".volu>img").addEventListener("click", e => {
        // console.log(e.target);
        console.log("changing", e.target.src);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })

    // Play the next song when the current one ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });


}
main();

