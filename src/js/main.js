const formSubmitButton = document.getElementById('simulator-button');
const hero = document.getElementById('hero');
let lifts = []; // this is array of objects in which each object contains state of lifts.
let floors = [];
let pending = [];

formSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const numberOfFloors = document.getElementsByClassName('simulator-input')[0].value;
    const numberOfLifts = document.getElementsByClassName('simulator-input')[1].value;

    if (!numberOfFloors) {
        alert("Please enter number floors.");
    }

    if (!numberOfLifts) {
        alert("Please enter number of lifts.");
    }
    if( numberOfFloors < 0 || numberOfLifts < 0){
        alert("Don't you think all values should be positive???");
        return ;
    }
    console.log(numberOfFloors, numberOfLifts);
    hero.style.display = "none";
    generateFloors(numberOfFloors, numberOfLifts);
    generateLifts(numberOfLifts);
});

const rootElement = document.getElementById('root');
const generateFloors = (floorCount, liftCount) => {
    const viewportWidth = window.innerWidth;
    const calculatedWidth = 100 * liftCount;
    for (let index = 0; index < floorCount; index++) {
        const floor = document.createElement("div");
        floor.classList.add('floor')
        floor.id = `floor${floorCount - index - 1}`;
        floor.style.width = viewportWidth > calculatedWidth ? `${viewportWidth - 100}px` : `${calculatedWidth}px`;
        // button container
        const buttonsContainer = document.createElement("div");
        const floorNumber = floorCount - index - 1;
        const floorNamePlate = document.createElement('p');
        floorNamePlate.innerHTML = `floor ${floorNumber}`;
        const UpButton = document.createElement("button");
        UpButton.innerHTML = 'Up';
        UpButton.classList.add('up');
        UpButton.id = `up${floorNumber}`;
        UpButton.addEventListener('click', liftButtonHandler);
        const downButton = document.createElement("button");
        downButton.classList.add('down');
        downButton.addEventListener('click', liftButtonHandler);
        downButton.id = `down${floorNumber}`;
        downButton.innerHTML = 'Down';
        buttonsContainer.classList.add("buttons-wrapper");
        buttonsContainer.appendChild(UpButton);
        buttonsContainer.appendChild(downButton);
        buttonsContainer.appendChild(floorNamePlate);
        floor.appendChild(buttonsContainer);
        rootElement.appendChild(floor);
        floors.push(floor);

    }
}
const generateLifts = (liftCount) => {
    let intervalId;
    clearInterval(intervalId)
    for (let index = 0; index < liftCount; index++) {
        const groundFloor = document.querySelector("#floor0");
        const lift = document.createElement("div");
        const leftDoor = document.createElement("div");
        const rightDoor = document.createElement("div");
        leftDoor.classList.add("door");
        leftDoor.classList.add("door-left");
        rightDoor.classList.add("door");
        rightDoor.classList.add("door-right");
        leftDoor.id = `left-door${index}`;
        rightDoor.id = `right-door${index}`;
        lift.appendChild(leftDoor);
        lift.appendChild(rightDoor);
        lift.classList.add('lift');
        lift.id = `lift${index}`;
        lift.style.left = `${100 + index * 100}px`;
        const liftState = {
            id: index,
            isActive: false,
            currentFloor: 0,
            domElement: lift,
            isMoving: false,
            movingTo: null,
        }
        groundFloor.appendChild(lift);
        lifts.push(liftState)
    }


    setInterval(() => {
        scheduleLift();
    }, 100);
}
const liftButtonHandler = (event) => {
    const buttonId = (event.target.id);
    const floorNumber = Number(buttonId.charAt(buttonId.length - 1));
    const isLiftGoingToFloor = lifts.find(lift => lift.movingTo === floorNumber && lift.isMoving === true)
    if (isLiftGoingToFloor) {
        console.log("lift heading towards it wait.");
        return;
    }
    pending.push(floorNumber)
}

const findNearestLift = (lifts, destinationFloor) => {
    let nearestLiftDistance = floors.length;
    let nearestLiftId = lifts[0];
    for (let liftIndex = 0; liftIndex < lifts.length; liftIndex++) {
        const lift = lifts[liftIndex];
        if (Math.abs(lift.currentFloor - destinationFloor) < nearestLiftDistance && lift.isActive === false) {
            nearestLiftDistance = Math.abs(lift.currentFloor - destinationFloor);
            nearestLiftId = lift.id;
        }
    }
    return nearestLiftId;
}

const moveLift = (source, destination, liftId) => {
    const lift = lifts.find(lift => lift.id === liftId);
    const distance = -1 * (destination) * 160;
    const time = Math.abs(source - destination) * 2;
    const leftDoor = document.querySelector(`#left-door${liftId}`);
    const rightDoor = document.querySelector(`#right-door${liftId}`);
    setTimeout(() => {

        leftDoor.style.transform = `translateX(-100%)`;
        leftDoor.style.transition = `transform 2.5s`;
        rightDoor.style.transform = `translateX(100%)`;
        rightDoor.style.transition = `transform 2.5s`;
        lift.currentFloor = destination;
        lift.isMoving = false;
        lift.movingTo = null;
    }, time * 1000)

    lift.isActive = true;

    setTimeout(() => {
        leftDoor.style.transform = `translateX(0)`;
        leftDoor.style.transition = `transform 2.5s`;
        rightDoor.style.transform = `translateX(0)`
        rightDoor.style.transition = `transform 2.5s`;

    }, time * 1000 + 2500)
    setTimeout(() => {
        lift.isActive = false;
    }, time * 1000 + 5000)
    lift.isMoving = true;
    lift.movingTo = destination;
    lift.domElement.style.transform = `translateY(${distance}px)`;
    lift.domElement.style.transition = `transform ${time}s`
}


const scheduleLift = () => {
    if (pending.length === 0) return;
    const floor = pending.shift();
    const nearestLiftId = findNearestLift(lifts, floor);
    const nearestLift = lifts.find(lift => lift.id === nearestLiftId);

    if (!nearestLift) {
        pending.unshift(floor);
        return;
    }
    moveLift(nearestLift.currentFloor, floor, nearestLiftId);
}
