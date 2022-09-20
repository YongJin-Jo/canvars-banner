import { useRef } from "react"
import styled from "styled-components"
import BannerCostemPage from "./components/page/BannerCostemPage"

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const StyledHeader= styled.div`
width: 100%;
height: 50px;
background-color: orange;
`
function App() {
  const headerRef = useRef<HTMLDivElement | null>(null)

  return (
    <AppContainer  className="App">
      <StyledHeader ref={headerRef}/>
      <BannerCostemPage
      headerRef={headerRef.current}
      />
    </AppContainer>
  )
}

export default App
