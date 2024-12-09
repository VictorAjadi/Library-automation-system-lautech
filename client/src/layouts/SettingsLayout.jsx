import React, { useState } from "react";
import styled from "styled-components";
import { FaBars, FaUser, FaDollarSign, FaBell, FaSearch } from "react-icons/fa";
import { MdGroups, MdLibraryBooks} from "react-icons/md";
import { Outlet } from "react-router-dom";
import ThemeToggler from "../components/ThemeToggler"
import useImage from "../hooks/useImage";
import CustomImage from "../components/CustomImage";
import { useThemeStore, useUserData } from "../hooks/store";
import LinkButton from "../components/LinkButton"
import toast, { Toaster } from "react-hot-toast";
import { BiSolidBookAdd } from "react-icons/bi";
import { createNewBook } from "../utils/api";
import UploadForm from "../components/UploadForm";
import ModalButton from "../components/ModalButton";
import { BsQrCodeScan } from "react-icons/bs";

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100%;
  background-color: inherit;
`;

const Sidebar = styled.div`
  transition: width 0.3s;
  width: ${(props) => (props.shrink==='true' ? "100px" : "300px")};
  background-color: inherit;
  padding: 20px;
  border-right: 1px solid #333;
  position: relative;
  display: flex;
  align-items: ${(props) => (props.shrink==='true'? "center" : "start")};
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.shrink==='true' ? "column" : "row")};
  justify-content: space-between;
  border-bottom: 1px solid #333;
  gap: 20px;
  align-items: center;
  position: sticky;
  width: 100%;
  z-index: 10;
  background-color: ${(props) =>(props.theme === 'light'?'#fff':'#222')};
  top: 0;
`;

const SidebarInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 20px 0;
  border: none;
  border-radius: 5px;
  background-color: #333;
  color: #fff;
`;

const SidebarList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  height: 100%;
  width: ${(props) => (props.shrink==='true' ? "auto" : "100%")} ;
`;

const SidebarListItem = styled.div`
  padding: 15px 10px;
  margin: 5px 0;
  border-bottom: 1px solid #333;
  cursor: pointer;
  position: relative; /* For absolute positioning of the tooltip */
  color: inherit;
  display: flex;
  align-items: center;
  gap: 20px;
  &:hover,
  &.active {
    background-color: #333;
    border-radius: 5px;
    color: #fff;
  }

  span {
    display: ${(props) => (props.shrink==='true' ? "none" : "inline")};
  }

  /* Tooltip */
  &:hover::after {
    content: "${(props) => (props.shrink==='true' ? props.label : "")}";
    position: absolute;
    left: 110%; /* Place tooltip outside the icon */
    top: 50%;
    transform: translateY(-50%);
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    white-space: nowrap;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000; /* Ensure the tooltip is above all elements */
    display: ${(props) => (props.shrink==='true' ? "block" : "none")};
  }
`;



const Content = styled.div`
  flex-grow: 1;
  padding: 20px;
  height: 100%;
  background-color: inherit;
  color: inherit;
`;
const SidebarFooter = styled.div`
  padding: 5px 0;
  margin-top: 100%;
  text-align: center;
  border-top: 1px solid #333;
  color: inherit;
  background-color: ${(props) =>(props.theme === 'light'?'#fff':'#222')};
  position: sticky;
  bottom: 0;
  width: 100%;
  z-index: 10;
`;


const Toggler = styled.div`
  cursor: pointer;
`;

const SettingsLayout = () => {
  const [shrink, setShrink] = useState(false);
  const theme = useThemeStore(state=>state.theme);
  const logo = useImage().logo;
  const avatar = useImage().avatar;
  const toggleSidebar = () => {
    setShrink((prev) => !prev);
  };
  const userData = useUserData(state=>state.state)
  const [loading,setLoading]=useState('idle')
  const handleNewBook = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const form = event.target;
    const formData = new FormData(form)
    setLoading('submitting');
    const load = toast.loading('Creating...');
    const response = await createNewBook(formData)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
    }else{
        toast.error(response.message);
    }
    return;
  };
  return (
    <Container>
      {/* Sidebar */}
      <Sidebar shrink={`${shrink}`}>
        <SidebarHeader shrink={`${shrink}`} className="pb-3" theme={theme}>
          <p className={`${shrink ? '' : 'fw-bold fs-4'} m-0 p-0 order-1 text-nowrap d-inline-flex flex-nowrap gap-2 align-items-center`} ><CustomImage src={logo} className='rounded-cicle' style={{width: '55px',height: '55px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
           <span className="">{shrink ? '' : "Library"}</span></p>
          <div className={`${shrink ? 'order-3': 'order-2'}`}>
          <ThemeToggler/>
          </div>
          <Toggler onClick={toggleSidebar} className={`${shrink ? 'order-2': 'order-3'}`}>
            <FaBars />
          </Toggler>
        </SidebarHeader>

{/*    {shrink ? <FaSearch  onClick={toggleSidebar} className=" my-4 pointer fs-1"/> : <SidebarInput type="text" placeholder="Search Settings" /> }
 */}
        <SidebarList shrink={`${shrink}`}>
        {
            (userData.role === 'admin' || userData.role === 'sub-admin') &&
            <LinkButton to={`/admins/console/`} className="w-100 rv-txdec" text={ 
              <SidebarListItem shrink={`${shrink}`} label="Dashboard">
                <MdLibraryBooks />
                <span>Dashboard</span>
              </SidebarListItem>
              }
            />
        }

          <LinkButton to={(userData.role==='admin' || userData.role==='sub-admin') ? `/admins/console/settings` : `/settings`} className="w-100 rv-txdec" text={ 
            <SidebarListItem shrink={`${shrink}`} label="Your account">
            <FaUser />
            <span>Your account</span>
          </SidebarListItem>
            }
          />

          <LinkButton to={(userData.role==='admin' || userData.role==='sub-admin') ? `/admins/console/books` : `/books`} className="w-100 rv-txdec" text={ 
            <SidebarListItem shrink={`${shrink}`} label="Books">
              <MdLibraryBooks />
              <span>Books</span>
            </SidebarListItem>
            }
          />
          {
            (userData.role === 'admin' || userData.role === 'sub-admin') &&
            <>
              <SidebarListItem className="w-100" shrink={`${shrink}`} label="Add Books">
                <BiSolidBookAdd />
                <span>
                  <ModalButton
                    buttonText='Add Book'
                    buttonClassname='btn btn-primary p-2 w-100 rounded-2 shadow'
                    title={'Add New Book'}
                    children={
                      <UploadForm action={handleNewBook} id={'vchjmhjb'} loading={loading}/>
                    }
                  />
                </span>
              </SidebarListItem>
              <LinkButton to="/admins/console/scan" className="w-100 rv-txdec" text={ 
                <SidebarListItem shrink={`${shrink}`} label="Scan">
                  <BsQrCodeScan />
                  <span>Scan</span>
                </SidebarListItem>
                }
              />
            </>
          }

          <LinkButton to={(userData?.role === 'admin' || userData?.role === 'sub-admin') ? '/admins/console/departmental':"/departmental"} className="w-100 rv-txdec" text={ 
            <SidebarListItem shrink={`${shrink}`} label="Departmental Mate">
              <MdGroups />
              <span>Departmental {userData?.role === 'student' ? 'Mate': 'Staff'}</span>
            </SidebarListItem>
            }
          />
          <LinkButton to="/notifications" className="w-100 rv-txdec" text={ 
            <SidebarListItem shrink={`${shrink}`} label="Notifications">
              <FaBell />
              <span>Notifications</span>
            </SidebarListItem>
            }
          />
        </SidebarList>

        <SidebarFooter theme={theme}>
          <div className="d-inline-flex align-items-center justify-content-start w-100 gap-3">
             <CustomImage src={userData?.profileImg?.url || avatar} className='rounded-circle' style={{width: '40px',height: '40px'}}/>
             {
              shrink===false &&
              <span>
              <p className="p-0 m-0 text-capitalize fw-bold">{userData?.name}</p>
              <p className="p-0 m-0">{userData?.matricNo || 'Staff'}</p>
             </span>
             }
          </div>
        </SidebarFooter>
      </Sidebar>
      {/* Content */}
      <Content>
        <Toaster position="top-right" reverseOrder={false}/>
        <Outlet/>
      </Content>
    </Container>
  );
};

export default SettingsLayout;
