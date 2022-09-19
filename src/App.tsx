import styled from "styled-components"
import BannerCostemPage from "./components/page/BannerCostemPage"

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const StyledHeader= styled.header`
width: 100%;
height: 50px;
background-color: orange;
`
function App() {
  return (
    <AppContainer className="App">
      <StyledHeader/>
      <BannerCostemPage/>
    </AppContainer>
  )
}

export default App
