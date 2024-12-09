import avatar from '../images/avatar.png'
import authBg from '../images/background-auth.jpg'
import logo from '../images/logo.png'
import school from '../images/school-background.png'

function useImage() {
  return {
    avatar: avatar,
    backgroundImage: authBg,
    logo:logo,
    school: school
  }
}

export default useImage