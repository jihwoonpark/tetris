import BLOCKS from './blocks.js';

//DOM
const $playground = document.querySelector('#playground');
const $tbody = $playground.querySelector('tbody');

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

const movingItem = {
    type:"elLeft", //종류
    direction : 0, //모양
    top:0, //위치
    left:3
}

//functions
const init = ()=>{   
    tempMovingItem = {...movingItem};//movingItem값 복사
    for( let i = 0; i< GAME_ROWS ;i++){
        prependNewLine();
    }
    renderBlocks();
}

const prependNewLine = () => {
    let $tr = document.createElement('tr');        
    for(let j =0; j<GAME_COLS; j++){
        let $td = document.createElement('td');
        $tr.append($td);
    };
    $tbody.append($tr);
};

const renderBlocks = (moveType="") => {
    const {type, direction, top, left} = tempMovingItem;
    //(반복문은 비동기로 나중에 실행되서) 이전상태에 moving 클래스 붙은 요소 검색
    const movingBlocks = document.querySelectorAll('.moving');//처음엔 nodelist[]       

    movingBlocks.forEach(moving=>{
        moving.classList.remove(type,'moving');        
    })    
    console.log('before', movingItem);
    BLOCKS[type][direction].some(coord =>{//forEach는 중간에 return할 수 없어서 some으로 변경
        let x = coord[0] + left;
        let y = coord[1] + top;
        // console.log('coor', coord);
       
        const target = $tbody.children[y] ? $tbody.children[y].children[x] : null;
        // console.log('target.classList.contains(seized)',target?.classList.contains('seized'))
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            target.classList.add(type, 'moving');             
        }else{    
            tempMovingItem = {...movingItem}; //이전 상태로 되돌림
            setTimeout(()=>{//재귀함수, maximum call stack 방지    
                console.log('setTimeout');              
                renderBlocks();//seizeBlock전에 실행해야 이전상태로 돌아감
                if(moveType ==="top"){
                    seizeBlock();
                }else if(moveType ==="left" && target?.classList.contains('seized')){
                    seizeBlock();
                }            
            },0)
            return true;
        }        
    });
    
    movingItem.direction = direction;
    movingItem.left = left;
    movingItem.top = top;    
    console.log('after', movingItem);
};

const seizeBlock = ()=>{
    console.log('seizeBlock')
    const movingBlocks = document.querySelectorAll('.moving');//처음엔 nodelist[]           
    movingBlocks.forEach(moving=>{        
        moving.classList.remove('moving');
        moving.classList.add('seized');  
    })
    console.log('gererate in seizeBlock')     
    generateNewBlock(); 
}

const generateNewBlock = () =>{
    console.log('generate');
    const typeList = ["tree", "line", "elLeft","elRight","zee","square"];
    const chosenType = typeList[Math.floor(Math.random()*6)];
    const chosenDirection = Math.floor(Math.random()*4);
    
    // 나는 tempMovingItem을 바꿨는데, 강의에서는 movingItem을 바꿈
    // tempMovingItem.type = chosenType;
    // tempMovingItem.direction = chosenDirection;
    // tempMovingItem.top = 0;
    // tempMovingItem.left = 3;

    movingItem.type = chosenType;
    movingItem.direction = chosenDirection;
    movingItem.top = 0;
    movingItem.left = 3;

    tempMovingItem = {...movingItem};

    // console.log(chosenType);
    // console.log(chosenDirection);
    renderBlocks();
}

const checkEmpty = (target) =>{
    console.log('checkEnmpty target', target) 
    if(!target || target.classList.contains('seized')){
        return false;
    }
    return true;
}

const moveBlock = (moveType,amount) =>{
    tempMovingItem[moveType] += amount;    
    renderBlocks(moveType);
};

const changeDirection = () => {   
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

//event handling
document.addEventListener('keydown',e=>{        
    switch (e.code) {
        case 'ArrowRight':
            moveBlock('left',1);            
            break;  
        case 'ArrowLeft':
            moveBlock('left',-1);
            break;   
        case 'ArrowDown':            
            moveBlock('top',1);                
            break;
        case 'ArrowUp':        
        changeDirection();
        break;
        default:
            break;
    }
});

init();