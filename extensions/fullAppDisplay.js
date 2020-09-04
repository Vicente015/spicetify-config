/// <reference path="../globals.d.ts" />

(function FullAppDisplay() {
    if (!Spicetify.Player || !Spicetify.Player.data || !Spicetify.LocalStorage) {
        setTimeout(FullAppDisplay, 200)
        return
    }

    const style = document.createElement("style")
    const styleString = `
#full-app-display {
    display: none;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 500;
    cursor: default;
}
#fad-header {
    position: fixed;
    width: 100%;
    height: 80px;
    -webkit-app-region: drag;
}
#fad-foreground {
    position: relative;
    top: 0;
    left: -3vw;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
#fad-art-inner {
    position: relative;
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    animation: rotate 20s linear infinite;
    border-radius: 100%;
    background-size: cover;
    -webkit-mask-image: radial-gradient(0.8vw at 50% 50% , transparent 98%, black 100%);
    border: 3px solid black;
}
#fad-art-dvd-center {
    position: absolute;
    width: 24%;
    height: 24%;
    left: 38%;
    top: 38%;
    background-color: #ccca;
    border-radius: 100%;
    border: 3px solid #000;
}
#fad-progress-container {
    width: 100%;
    display: flex;
    align-items: center;

}
#fad-progress {
    width: 100%;
    height: 6px;
    border-radius: 6px;
    background-color: #ffffff50;
    overflow: hidden;
}
#fad-progress-inner {
    height: 100%;
    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.8);
    transition: width 0.1s ease-out;
}
#fad-elapsed {
    margin-right: 10px;
}
#fad-duration {
    margin-left: 10px;
}
#fad-background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    transform: scale(1.5);
}
#fad-background-image {
    height: 100%;
    background-size: cover;
    filter: blur(4.5vmin) brightness(0.5);
    background-position: center;
}
#fad-artist::before {
    content: "\\f168";
}
#fad-album::before {
    content: "\\f167";
}
body.fad-activated #full-app-display {
    display: block
}
@keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.paused{
    animation-play-state: paused;
}
#fad-foreground {
    flex-direction: row;
    text-align: left;
}
#fad-art {
    width: calc(100vw - 840px);
    min-width: 200px;
    max-width: 340px;
}
#fad-details {
    padding-left: max(8vw, 50px);
    line-height: initial;
    max-width: 70%;
    color: #FFFFFF;
}
#fad-title {
    font-size: min(5vw, 72px);
    font-weight: var(--glue-font-weight-black);
}
#fad-artist, #fad-album {
    margin-top: 1vh;
    font-size: min(5vw, 58px);
    font-weight: var(--glue-font-weight-medium);
}
#fad-artist::before, #fad-album::before {
    font-size: 36px;
    opacity: 30%;
    font-family: "glue-spoticon";
    line-height: 70px;
    vertical-align: bottom;
    padding-right: 12px;
}
#fad-status {
    display: flex;
    min-width: 300px;
    max-width: 500px;
    width: 40vw;
    align-items: center;
}
#fad-status.active {
    margin-top: 6vh;
}
#fad-controls {
    display: flex;
    margin-right: 10px;
}
#fad-artist::before, #fad-album::before {
    display: none;
}`
    
    const container = document.createElement("div")
    container.id = "full-app-display"
    /** @type { HTMLImageElement } */  let cover
    /** @type { HTMLImageElement } */  let background
    /** @type { HTMLImageElement } */  let next
    /** @type { HTMLImageElement } */  let prev
    /** @type { HTMLImageElement } */  let title
    /** @type { HTMLImageElement } */  let artist
    /** @type { HTMLImageElement } */  let prog
    /** @type { HTMLImageElement } */  let elaps
    /** @type { HTMLImageElement } */  let durr
    /** @type { HTMLButtonElement } */ let play

    function render() {
        Spicetify.Player.removeEventListener("songchange", updateInfo)
        Spicetify.Player.removeEventListener("onprogress", updateProgress)
        Spicetify.Player.removeEventListener("onplaypause", updateControl)

        style.innerHTML = styleString

        container.innerHTML = `
<div id="fad-background"><div id="fad-background-image"></div></div>
<div id="fad-header"></div>
<div id="fad-foreground">
    <div id="fad-art">
        <div id="fad-art-image">
            <div id="fad-art-inner">
                <div id="fad-art-dvd-center"></div>
            </div>
        </div>
    </div>
    <div id="fad-details">
        <div id="fad-title"></div>
        <div id="fad-artist"></div>
        <div id="fad-album"></div>
        <div id="fad-status" class="active">
            <div id="fad-controls">
                <button id="fad-prev" class="button spoticon-skip-back-16"></button>
                <button id="fad-play" class="button spoticon-play-16"></button>
                <button id="fad-next" class="button spoticon-skip-forward-16"></button>
            </div>
            <div id="fad-progress-container">
                <span id="fad-elapsed"></span>
                <div id="fad-progress"><div id="fad-progress-inner"></div></div>
                <span id="fad-duration"></span>
            </div>
        </div>
    </div>
</div>`

        cover = container.querySelector("#fad-art-inner")
        background = container.querySelector("#fad-background-image")
        title = container.querySelector("#fad-title")
        artist = container.querySelector("#fad-artist")
        album = container.querySelector("#fad-album")
        prog = container.querySelector("#fad-progress-inner")
        durr = container.querySelector("#fad-duration")
        elaps = container.querySelector("#fad-elapsed")
        play = container.querySelector("#fad-play")
        next = container.querySelector("#fad-next")
        prev = container.querySelector("#fad-prev")

        play.onclick = Spicetify.Player.togglePlay
        next.onclick = Spicetify.Player.next
        prev.onclick = Spicetify.Player.back
    }

    const classes = [
        "video",
        "video-full-screen",
        "video-full-window",
        "video-full-screen--hide-ui",
        "fad-activated"
    ]
    
    async function updateInfo() {
        cover.style.backgroundImage = background.style.backgroundImage = `url("${Spicetify.Player.data.track.metadata.image_xlarge_url}")`
        title.innerText = Spicetify.Player.data.track.metadata.title
        artist.innerText = Spicetify.Player.data.track.metadata.artist_name
        durr.innerText = Spicetify.Player.formatTime(Spicetify.Player.getDuration())
    }

    function updateProgress() {
        prog.style.width = Spicetify.Player.getProgressPercent() * 100 + "%"
        elaps.innerText = Spicetify.Player.formatTime(Spicetify.Player.getProgress())
    }

    function updateControl() {
        if (Spicetify.Player.isPlaying()) {
            play.classList.replace("spoticon-play-16", "spoticon-pause-16")
            cover.style.animationPlayState = 'running'
        } else {
            play.classList.replace("spoticon-pause-16", "spoticon-play-16")
            cover.style.animationPlayState = 'paused'
        }
    }

    function activate() {
        Spicetify.Player.addEventListener("songchange", updateInfo)
        Spicetify.Player.addEventListener("onprogress", updateProgress)
        Spicetify.Player.addEventListener("onplaypause", updateControl)
        updateInfo()
        updateProgress()
        updateControl()
        document.body.classList.add(...classes)
    }

    function deactivate() {
        Spicetify.Player.removeEventListener("songchange", updateInfo)
        Spicetify.Player.removeEventListener("onprogress", updateProgress)
        Spicetify.Player.removeEventListener("onplaypause", updateControl)
        document.body.classList.remove(...classes)
    }

    // Add activator on top bar
    const button = document.createElement("button")
    button.classList.add("button", "spoticon-minimise-16", "fad-button")
    button.setAttribute("data-tooltip", "Full App Display")

    document.querySelector("#view-browser-navigation-top-bar").append(button)
    document.getElementById("video-player").append(style, container)

    // Add setting toggles in right click menu
    container.setAttribute("data-uri", "spotify:special:fullappdisplay")
    container.setAttribute("data-contextmenu", "")

    const checkURI = ([uri]) => uri === "spotify:special:fullappdisplay"

    new Spicetify.ContextMenu.Item("Exit", deactivate, checkURI).register()

    button.onclick = activate
    container.ondblclick = deactivate

    render()
})()
