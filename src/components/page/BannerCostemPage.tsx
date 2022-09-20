

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { canvasTarget, createElement, getElementAtPosition, isTextReWriteing, resizingCoordinates } from '../../lib/util/canvas/drawingAction'
import { adjustElementCoordinates, CalculatesMovingPoints } from '../../lib/util/canvas/math'
import { Action, ElementsInfo, ElementsList, ElementsPencilPosition, ElementsPosition, SelectPosition, Tool } from '../../types/canvarsDefine'
import { cloneDeep } from 'lodash'
import { cursorForPosition } from '../../lib/util/canvas/cursorStyle'
import { useHistory } from '../../lib/hooks/canvasHistory'
import { backgroundImgData } from '../../data/cavasData'
const StyledPageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;

  
  align-items: center;
  justify-content: center;
  background-color: gray;
  position: relative;

`

const StyledCanvars = styled.div`
  position: relative;
  
  > textarea{
    width: 70%;
    position: absolute;
    border:1px  dashed gray;
    top: 0;
    left: 0;
    background-color:transparent;
    font-family: 'sans-serif';
  }
`

const SettingContainer = styled.div`
position: fixed;
top: 3rem;
left: 0;
  display: flex;
  flex-direction: column;
`

const StyledToolbar = styled.div` 
  width: 13rem;
  height: 10rem;
  display: flex;
  top:3rem;
  left: 0;
  flex-direction: column;
  border: 1px solid black;
  display: flex;
  padding: 1rem;
  margin: 1rem;
  background-color: white;
  z-index: 1;
`

const StyledImgTemplateWrapper = styled.ul`
  background-color: white;
  padding: 1rem;
  margin: 1rem;
  width: 13rem;
  height: 18rem;
  overflow: auto;
  >li {
  margin: 1rem;
  padding: 0.5rem;
  border: 1px solid black;
  cursor: pointer;
    > img{
    width: 100%;
    height: 100%;
  }
  }
  
`

interface IProps{
  headerRef:HTMLDivElement | null
}

const BannerCostemPage = ({headerRef}:IProps) => {
  const img = new Image()
  const [imgIndex,setImgIndex] = useState<number>(0)
  const [fontState,setFontState] = useState<string>('sans-serif')
  const [fontSize,setFontSize] = useState<string>('10px')
  img.src = backgroundImgData[imgIndex]
  const pageRef =  useRef< HTMLDivElement | null>(null) 
  const canvasWrapperRef = useRef< HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textAreaRef= useRef<HTMLTextAreaElement | null>(null)
  const [tooltype, setTooltype] = useState<Tool>('text');
  const [selectedElement, setSelectedElement] = useState<SelectPosition | null>(
    null
  );
  const [elements, setElements, undo, redo] = useHistory({});
  const [action, setAction] = useState<Action>('none');

  useLayoutEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const width = img.width
    const height = img.height
    canvas.width = width;
    canvas.height = height;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(img,0,0,img.width,img.height)
    const core = canvasTarget(canvas);
    Object.values(elements).forEach(data => core(data));
  }, [elements,imgIndex]);

  // useEffect(() => {
  //   const undoRedo = undoRedoFunction(redo, undo);
  //   document.addEventListener('keydown', undoRedo);
  //   return () => {
  //     document.removeEventListener('keydown', undoRedo);
  //   };
  // }, [undo, redo]);

  useEffect(() => {
    if (action === 'writing') {
      const textarea = textAreaRef.current as HTMLTextAreaElement;
      textarea.value = selectedElement?.text as string;
    }

  }, [action, selectedElement]);

  const updateElement = ({
    id,
    type,
    position,
    points,
    text,
  }: ElementsInfo) => {
    const elementsCopy = { ...elements };

    switch (type) {
      case 'line':
      case 'rect': {
        const updatedEleElement = createElement({
          id,
          type,
          position,
          points,
        });
        const { x1, y1, x2, y2 } = adjustElementCoordinates(updatedEleElement);

        elementsCopy[id] = {
          id,
          type,
          position: null,
          points: [{ x1, y1, x2, y2 }],
        };
        break;
      }
      case 'pencil': {
        const [{ x1, y1 }] = points as ElementsPencilPosition[];

        elementsCopy[id].points = [
          ...(elementsCopy[id].points as ElementsPencilPosition[]),
          { x1, y1 },
        ];
        break;
      }
      case 'text': {
        const [{ x1, y1 }] = points;
        const canvas = canvasRef.current as HTMLCanvasElement;
        const textWidth = canvas.getContext('2d')?.measureText(text as string)
          .width as number;
        const textHeight = 48;
        elementsCopy[id] = {
          id,
          points: [{ x1, y1, x2: x1 + textWidth, y2: y1 + textHeight }],
          position,
          type,
          text,
          font:fontState,
          fontSize:fontSize
        };

        break;
      }
      default:
        throw new Error('not fount type');
    }

    setElements(elementsCopy, true);
  };

  const handleMouseDoun = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (action === 'writing') return;
    
    let { pageX, pageY } = event;
    
    const mathX = pageRef.current?.clientWidth - canvasRef.current?.clientWidth
    pageX = Math.abs(pageX - mathX/2)
    pageY = Math.abs(pageY-50)
    
    if (tooltype === 'selection') {
      const element = getElementAtPosition(pageX, pageY, elements);
   
      if (element) {
        let offsetX: number | number[];
        let offsetY: number | number[];

        if (element.type === 'pencil') {
          offsetX = element.points.map(point => {
            const x1 = pageX - point.x1;
            return x1;
          });
          offsetY = element.points.map(point => {
            const y1 = pageY - point.y1;
            return y1;
          });
        } else {
          offsetX = pageX - element.points[0].x1;
          offsetY = pageY - element.points[0].y1;
        }

        setSelectedElement({
          ...element,
          offsetX,
          offsetY,
        });

        setElements(prevState => prevState);

        // Action 상태값 변경
        element.position === 'inside'
          ? setAction('moving')
          : setAction('resize');
      }
      return;
    }

    if(tooltype==='remove'){
      const element = getElementAtPosition(pageX, pageY, elements);
      const elementCopy = cloneDeep(elements)
      const FindEle = Object.keys(elementCopy).find(item => item === element.id)
      
      if(FindEle !=undefined){
        delete elementCopy[FindEle]
        setElements(elementCopy)
        return
      }
      return
    }

    setAction(tooltype === 'text' ? 'writing' : 'drawing');

    const createPosition: ElementsInfo = {
      id: Date.now().toString(),
      type: tooltype,
      position: null,
      points:
        tooltype === 'pencil' || tooltype === 'text'
          ? [{ x1: pageX, y1: pageY }]
          : [{ x1: pageX, y1: pageY, x2: pageX, y2: pageY }],
    };

    const updateElement = createElement(createPosition);
    setSelectedElement({ ...updateElement, offsetX: 0, offsetY: 0 });
    setElements((prevState: ElementsList) => {
      return { ...prevState, [createPosition.id]: updateElement };
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    let { pageX, pageY } = event;
    const mathX = pageRef.current?.clientWidth - canvasRef.current?.clientWidth
    pageX = Math.abs(pageX - mathX/2)
    pageY = Math.abs(pageY-50)
    if(tooltype==='remove'){
      const element = getElementAtPosition(pageX, pageY, elements);
      event.currentTarget.style.cursor =element?'pointer':'default'
    }
    if (tooltype === 'selection' && action != 'writing') {
      const element = getElementAtPosition(pageX, pageY, elements);

      // mouseCursor Style 변경
      event.currentTarget.style.cursor = element
        ? cursorForPosition(element.position)
        : 'default';
    }
    if (action === 'drawing') {
      const { id, position, points, type } = selectedElement as SelectPosition;
      const pointIndex = points.length - 1;

      switch (type) {
        case 'line':
        case 'rect': {
          points[pointIndex] = {
            x1: points[pointIndex].x1,
            y1: points[pointIndex].y1,
            x2: pageX,
            y2: pageY,
          };

          updateElement({ id, position, points, type: tooltype });
          break;
        }
        case 'pencil': {
          updateElement({
            id,
            type: tooltype,
            position,
            points: [
              {
                x1: pageX,
                y1: pageY,
              },
            ],
          });
          break;
        }
      }
      return;
    }

    if (action === 'moving') {
      const { id, type, offsetX, offsetY, position, points, text } =
        selectedElement as SelectPosition;

      if (selectedElement?.type === 'pencil') {
        const offsetXList = offsetX as number[];
        const offsetYList = offsetY as number[];
        const newPoints = selectedElement.points.map((_, index) => {
          return {
            x1: pageX - offsetXList[index],
            y1: pageY - offsetYList[index],
          };
        });

        const elementsCopy = cloneDeep(elements);
        elementsCopy[id].points = [...newPoints];
        setElements(elementsCopy, true);
        return;
      }

      const pointsCopy = cloneDeep(points) as ElementsPosition[];

      const Index = pointsCopy.length - 1;

      const { newX1, newY1, w, h } = CalculatesMovingPoints(
        points as ElementsPosition[],
        pageX,
        pageY,
        offsetX as number,
        offsetY as number
      );

      pointsCopy[Index] = {
        x1: newX1,
        y1: newY1,
        x2: newX1 + w,
        y2: newY1 + h,
      };

      updateElement({
        id,
        type,
        position,
        points: pointsCopy,
        text,
      });

      return;
    }

    if (action === 'resize') {
      const { id, type, position, points } = selectedElement as SelectPosition;
      const { x1, y1, x2, y2 } = resizingCoordinates(
        pageX,
        pageY,
        position as string,
        points as ElementsPosition[]
      );

      updateElement({
        id,
        type,
        position,
        points: [{ x1, y1, x2, y2 }],
      });
      return;
    }
  };
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    let { pageX, pageY } = event;
    const mathX = pageRef.current?.clientWidth - canvasRef.current?.clientWidth
    pageX = Math.abs(pageX - mathX/2)
    pageY = Math.abs(pageY-50)

    if (selectedElement != null) {
      const { id, type, position, text } = selectedElement as SelectPosition;
      const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[id]);
      const isTextChange = isTextReWriteing(selectedElement, pageX, pageY);
      if (isTextChange) {
        event.currentTarget.style.cursor = 'default';
        updateElement({ id, type, position, points: [{ x1, y1, x2, y2 }], text:'' });

        setAction('writing');
        return;
      }
     
      updateElement({ id, type, position, points: [{ x1, y1, x2, y2 }], text });
    }
    if (action === 'writing') return;

    setAction('none');
    setSelectedElement(null);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    const { id, points, type, position } = selectedElement as SelectPosition;
    setAction('none');
    setSelectedElement(null);
    updateElement({
      id,
      type,
      position,
      points,
      text: event.currentTarget.value,
    });
  };
  return (
    <StyledPageContainer ref={pageRef} >
      <SettingContainer>
      <StyledToolbar>
        <div>
          <label htmlFor="">생성</label>
          <input type="radio" 
          checked={tooltype === 'text'? true:false}
          onChange={() => setTooltype('text')}
          />
        </div>
        <div>
          <label htmlFor="">선택</label>
          <input type="radio" 
          checked={tooltype ==='selection'? true:false}
          onChange={() => setTooltype('selection')}
          />
        </div>
        <div>
          <label htmlFor="">삭제</label>
          <input type="radio" 
          checked={tooltype ==='remove'? true:false}
          onChange={() => setTooltype('remove')}
          />
        </div>
        <label htmlFor="">글꼴크기</label>
        <input type="text" value={fontSize} onChange={(e) => setFontSize(e.target.value)}/>
        <label htmlFor="">글꼴</label>
        <input type="text" value={fontState} onChange={(e) => setFontState(e.target.value)}/>
        <div style={{"display":'flex'}}>
          <button onClick={() => undo()}>뒤로</button>
          <button onClick={() => redo()}>앞으로</button>
        </div>
      </StyledToolbar>
        <StyledImgTemplateWrapper>
          {backgroundImgData.map((item,index) =>
            <li onClick={() =>setImgIndex(index)}>
              <img src={item} />
            </li>
          )}
        </StyledImgTemplateWrapper>
      </SettingContainer>
    
      <StyledCanvars ref ={canvasWrapperRef}>
   
        {action ==='writing'?
          (
          <textarea
          ref={textAreaRef}  
          style={{ 
          left: selectedElement?.points[0].x1-10,
          top:selectedElement?.points[0].y1-10,
          fontSize
        }}
          onBlur={handleBlur}
          />):null
        }
        <canvas 
        
        onMouseDown={handleMouseDoun}
        onMouseUp={handleMouseUp}
        onMouseMove ={handleMouseMove}
         ref={canvasRef}></canvas>
      </StyledCanvars>
    </StyledPageContainer>
  )
}

export default BannerCostemPage