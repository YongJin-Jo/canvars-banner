import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const StyledPageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: gray;
`

const StyledCanvars = styled.div`
  position: relative;
  
  > textarea{
    display: none;
    border:1px  dashed gray;
    position: absolute;
    top: 0;
    left: 0;
  }
`

const StyledToolbar = styled.div`
  width: 40%;
  border: 1px solid black;
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
`
type tooltypeDefine = 'create' | 'select' 

const BannerCostemPage = () => {
  const pageRef =  useRef< HTMLDivElement | null>(null) 
  const canvasWrapperRef = useRef< HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textAreaRef= useRef<HTMLTextAreaElement | null>(null)
  const [positionData,setPostionData] = useState<null>(null)
  const [tooltype,setToolType] = useState<tooltypeDefine>('create')
  useEffect(()=>{
    const img = new Image()
    img.src = 'https://t1.daumcdn.net/cfile/tistory/997EC34E5C85AE7604?original'
    const form = canvasWrapperRef.current as HTMLDivElement
    const canvas = canvasRef.current as HTMLCanvasElement
    const width = img.width
    const heigth = img.height
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0,0,width,heigth)
    
    ctx.canvas.width =width
    ctx.canvas.height =heigth
    ctx.drawImage(img,0,0,img.width,img.height)
    ctx.font = '15px'
    ctx.fillText('안녕하세요',0,10,100)
  },[])

  const heandleMouseDown = (e:React.MouseEvent<HTMLCanvasElement>) =>{
    const {clientX,clientY} = e
    const textArea =  textAreaRef.current as HTMLTextAreaElement
    switch(tooltype){
      case'create':
      textArea.style.display ='inherit'
      textArea.style.left = clientX.toString()
      textArea.style.top = clientY.toString()

      return
      case'select':
      return

    }
  }

  const heandleMouseUp = (e:React.MouseEvent<HTMLCanvasElement>) =>{}

  const heandleMouseMove = (e:React.MouseEvent<HTMLCanvasElement>) =>{
    const {clientX,clientY} = e
    
  }
  return (
    <StyledPageContainer ref={pageRef} >
      <StyledToolbar>
        <label htmlFor="">생성</label>
        <input type="radio" 
        checked={tooltype === 'create'? true:false}
        onChange={() => setToolType('create')}
        />
        <label htmlFor="">선택</label>
        <input type="radio" 
        checked={tooltype != 'create'? true:false}
        onChange={() => setToolType('select')}
        />
        <label htmlFor="">글꼴크기</label>
        <input type="text" />
        <label htmlFor="">글꼴</label>
        <input type="text" />
      </StyledToolbar>
      <StyledCanvars ref ={canvasWrapperRef}>
   
        <textarea ref={textAreaRef} />
        <canvas 
        
        onMouseDown={heandleMouseDown}
        onMouseUp={heandleMouseUp}
        onMouseMove ={heandleMouseMove}
         ref={canvasRef}></canvas>
      </StyledCanvars>
    </StyledPageContainer>
  )
}

export default BannerCostemPage