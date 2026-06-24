const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];

for(let i=0;i<300;i++){

    stars.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        radius:Math.random()*2,
        speed:Math.random()*0.2
    });

}

function animate(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    stars.forEach(star=>{

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI*2
        );

        ctx.fillStyle="white";
        ctx.fill();

        star.y += star.speed;

        if(star.y > canvas.height){
            star.y = 0;
            star.x = Math.random()*canvas.width;
        }

    });

    requestAnimationFrame(
        animate
    );

}

animate();

window.addEventListener(
    "resize",
    ()=>{
        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;
    }
);
