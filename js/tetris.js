import BLOCKS from './blocks.js';

//DOM
const $playground = document.querySelector('#playground');
const $tbody = $playground.querySelector('tbody');
const $gameText = document.querySelector('.game-text');
const $retryButton = document.querySelector('.game-text > button');
const $scoreDisplay = document.querySelector('.score');

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 1000;
let downInterval;
let tempMovingItem;

const movingItem = {
    type:"", //종류
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
    generateNewBlock();
}

const prependNewLine = () => {
    let $tr = document.createElement('tr');
    $tr.style.border = 'none';
    for(let j =0; j<GAME_COLS; j++){
        let $td = document.createElement('td');
        $td.style.border = 'none';
        $td.style.boxSizing = 'border-box';
        $tr.prepend($td);
    };
    $tbody.prepend($tr);
};

const renderBlocks = (moveType="") => {
    const {type, direction, top, left} = tempMovingItem;
    //(반복문은 비동기로 나중에 실행되서) 이전상태에 moving 클래스 붙은 요소 검색
    const movingBlocks = document.querySelectorAll('.moving');//처음엔 nodelist[]       

    movingBlocks.forEach(moving=>{
        moving.classList.remove(type,'moving');
        moving.style.boxShadow ='';
    })    
    // console.log('before', movingItem);
    BLOCKS[type][direction].some(coord =>{//forEach는 중간에 return할 수 없어서 some으로 변경
        let x = coord[0] + left;
        let y = coord[1] + top;        
       
        const target = $tbody.children[y] ? $tbody.children[y].children[x] : null;        
        const isAvailable = checkEmpty(target); //다음 칸이 비었거나 seized 클래스가 있는지 확인

        if(isAvailable){
            target.classList.add(type, 'moving');
            target.style.border = '1px solid #fff';
            target.style.boxShadow ='inset -10px -10px 10px rgba(0,0,0,.1)';
        }else{    
            tempMovingItem = {...movingItem}; //이전 상태로 되돌림
            if(moveType==='retry'){
              clearInterval(downInterval);
              // document.removeEventListener('keydown');
              showGameoverText();
            }
            setTimeout(()=>{//재귀함수, maximum call stack 방지    
                // console.log('setTimeout');              
                //renderBlocks가 2번실행되면 즉, 이전상태로 돌렸는데도 다음 칸이 또 seizedBlock이라면 해당 block이 제일 꼭대기에 있다는 의미
                //=> 이런 논리는 따라가기 힘들다
                renderBlocks('retry');//seizeBlock전에 실행해야 이전상태로 돌아감                
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
    // console.log('after', movingItem);
};

const showGameoverText = () =>{ 
  $gameText.style.display = 'flex'
}

const seizeBlock = ()=>{
    // console.log('seizeBlock')
    const movingBlocks = document.querySelectorAll('.moving');//처음엔 nodelist[]           
    movingBlocks.forEach(moving=>{        
        moving.classList.remove('moving');
        moving.classList.add('seized');  
    })    
    checkMatch();
};

const checkMatch = () =>{ 
    const rows = $tbody.childNodes; //전체 tr
    rows.forEach(row=>{ //각tr    
        let matched = true;        
        row.childNodes.forEach(td=>{               
            if(!td.classList.contains('seized')){
                matched = false;
            };
        });
        if(matched){
            row.remove();
            score += 10;
            $scoreDisplay.innerHTML = score;
            prependNewLine();
        }
    });    

    // const seizedBlocks = document.querySelectorAll('.seized');
    // seizedBlocks.forEach(seizedBlock=>{
    //     // console.log('seizedparentNode',seizedBlock.parentNode)
    //     console.log('seizedparentNode_seizedChlidNum',seizedBlock.parentNode.querySelectorAll('.seized').length)        
    //     if(seizedBlock.parentNode.querySelectorAll('.seized') === 10) {
            
    //     };
    // })

    generateNewBlock();
}

const generateNewBlock = () =>{
    // console.log('generate');
    clearInterval(downInterval);
    downInterval = setInterval(() => {        
        moveBlock('top',1);
    }, duration);

    const blockArray = Object.entries(BLOCKS); //[[key,value],[key,value],]
    const typeList = [];
    blockArray.forEach(block=>{
        typeList.push(block[0])
    })
    
    const chosenType = typeList[Math.floor(Math.random()*blockArray.length)];
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
    
    renderBlocks();
}

const checkEmpty = (target) =>{
    // console.log('checkEnmpty target', target) 
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

const dropBlock = () =>{
    // console.log('dropBlock')
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top',1);
    }, 10);
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
        case 'Space':        
            dropBlock();
        break;
        default:
            break;
    }
});

$retryButton.addEventListener('click', ()=>{
    $tbody.innerHTML = "";
    $gameText.style.display = 'none';
    init();
}) 

init();
