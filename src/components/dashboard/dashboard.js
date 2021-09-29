import Head from "../header/header";
import "./dashboard.css";
import {
  Layout,
  // Breadcrumb,
  Table,
  Tag,
  Row,
  Col,
  Pagination,
  message,
  Input,
  Space,
  Popconfirm,
  Button,
  Dropdown,
  Menu,
} from "antd";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import OpenTicket from "../open ticket/open-ticket";
import { Helmet } from "react-helmet";
import debounce from "lodash/debounce";
import axios from "../../axios";
import English from "../../assets/english.svg";
import Persian from "../../assets/persian.svg";
import chooselanguage from "../../assets/chooselanguage.svg";
import { useTranslation } from "react-i18next";
import i18n from "../../utilies/i18n";
import { Slider } from "antd";
import moment from "jalali-moment";

const { Header, Content, Footer } = Layout;
const { Search } = Input;

function Home() {
  const [isfa, setfa] = useState(false);
  const Detectfa = (lng) => {
    if (lng === "fa") setfa(true);
    else setfa(false);
  };

  i18n.on("languageChanged", (lng) => {
    Detectfa(lng);
  });

  const [data1, setdata1] = useState([]);
  const [chnage, setchange] = useState(true);
  const [seeOpenTicket, setseeOpenTicket] = useState(true);
  const [openTicket, setOpenTicket] = useState(false);
  const [openTicketTime, setOpenTicketTime] = useState(false);
  const [idTiketOpen, setidTiketOpen] = useState({ name: "", subject: "" });
  const [commentTicket, setcommentTicket] = useState();
  const [curentData, setcurentData] = useState();
  const [archive, setarchive] = useState(true);
  const [range, setrange] = useState(4);

  useEffect(() => {
    if (i18n.language == "fa") {
      setfa(true);
    } else {
      setfa(false);
    }
  }, []);
  
  const rangeFunc = debounce((value) => {
    setrange(value)
    setchange(prev => !prev)
  },1000) // set time for checking last request
  const { t } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // change direrction persian -> rtl / english -> ltr
  };
  const [url, seturl] = useState("api/ticket");
  const deletTicket = (id) => {
    axios
      .put("api/ticket/" + id, {
        status: "Done",
      })
      .then((response) => {
        if (response.status === 202) {
          message.success(t("message.success-delete", { id }));
          setchange((prev) => !prev);
        }
      })
      .catch(() => message.error(t("message.failed-delete", { id })));
  };
  const addArchive = (id) => {
    axios
      .put(`api/ticket/${id}`, {
        archived: true,
      })
      .then((res) => {
        if (res.status === 202) {
          message.success(t("message.success-archive", { id }));
        }
      })
      .catch(() => {
        message.error(t("message.failed-archive", { id }));
      });
  };

  const showArchive = () => {
    const urlArchive = archive ? "?archived=1" : "";
    seturl("api/ticket" + urlArchive);
    setchange((prev) => !prev);
    setarchive((prev) => !prev);
  };
  const openTicketfunc = (id) => {
    axios
      .get("/api/ticket/" + id)
      .then((res) => {
        if (res.status === 200 || res.status === 202) {
          return res.data;
        } else {
          message.error(t("message.bug-archive"));
        }
      })
      .then(([find]) => { //ES6 and return 0 index
        axios
        .get("api/userslist?count=1000")
        .then(async(results)=>{ // for call backs - async first of function
          let users=await results.data.data.find((user)=>{
              return user.id==find.user_id
          })
          setidTiketOpen({
            key: find.id,
            description: "",
            priority: find.priority,
            task: find.type,
            status: [find.status],
            subject: find.subject,
            created: find.created_at,
            requester: users.first_name+" "+users.last_name,
            created2: +new Date(find.created_at),
            updated2: +new Date(find.updated_at),
          });
          setcommentTicket(find.contents);
          setOpenTicket(true);
          setOpenTicketTime(true);
        })
      })
  };

  let columns = [
    {
      title: t("columns.status"),
      dataIndex: "status",
      // eslint-disable-next-line react/display-name
      render: ([tag]) => {
        var color = "#0ead69";
        if (tag === "Done") {
          color = "#d00000";
        } else if (tag === "open") {
          color = "#fca311";
        } else if (tag === "Answered") {
          color = "#5c0099";
        } else if (tag === "In Progress") {
          color = "#05299e";
        } else if (tag === "new") {
          color = "#0ead69";
        }
        return (
          <span>
            <Tag color={color}>{t(`filters.${tag.trim()}`)}</Tag>
          </span>
        );
      },

      filters: [
        {
          text: t("filters.new"),
          value: "new",
        },
        {
          text: t("filters.In Progress"),
          value: "In Progress",
        },
        {
          text: t("filters.Answered"),
          value: "Answered",
        },
        {
          text: t("filters.open"),
          value: "open",
        },
        {
          text: t("filters.Done"),
          value: "Done",
        },
      ],
      onFilter: (value, record) => {
        return record.status.indexOf(value) === 0;
      },
    },
    {
      title: "#",
      dataIndex: "number",
      sorter: (a, b) => a.number - b.number,
      // eslint-disable-next-line react/display-name
      render: function (props) {
        return (
          <>
            <span
              className={isfa ? "PersianNo" : ""}
              dangerouslySetInnerHTML={{ __html: props }} //CHECK
            ></span>
          </>
        );
      },
    },
    {
      title: t("columns.title"),
      dataIndex: "subject",
      // eslint-disable-next-line react/display-name
      render: (subject) => {
        const sub = subject.match("Admin: ") ? "#00b4d8" : "black"
        if(sub == "#00b4d8"){
          return <span style={{color: sub}}><b>{subject}</b></span>
        }
        return <span style={{color: sub}}>{subject}</span>
      }
    },
    {
      title: t("columns.priority"),
      dataIndex: "priority",
      // eslint-disable-next-line react/display-name
      render: (priority) => {
        var color = "#0ead69";
        if (priority === "Critical") {
          color = "#ff6700";
        } else if (priority === "Normal") {
          color = "#3bceac";
        } else if (priority === "Urgent") {
          color = "#fad643";
        }
        return (
          <span>
            <Tag color={color} key={priority}>
              {t(`filters.${[priority]}`)}
            </Tag>
          </span>
        );
      },

      filters: [
        {
          text: t("filters.Critical"),
          value: "Critical",
        },
        {
          text: t("filters.Urgent"),
          value: "Urgent",
        },
        {
          text: t("filters.Normal"),
          value: "Normal",
        },
      ],
      onFilter: (value, record) => {
        return record.priority.indexOf(value) === 0;
      },
    },
    {
      title: t("columns.type"),
      dataIndex: "type",
      // eslint-disable-next-line react/display-name
      render: (type) => {
        var color = "#0ead69";
        if (type === "Issue") {
          color = "#ee6055";
        } else if (type === "Task") {
          color = "#134074";
        }
        return (
          <span>
            <Tag color={color} key={type}>
              {t(`filters.${[type]}`)}
            </Tag>
          </span>
        );
      },

      filters: [
        {
          text: t("filters.Issue"),
          value: "Issue",
        },
        {
          text: t("filters.Task"),
          value: "Task",
        },
      ],
      onFilter: (value, record) => {
        return record.type.indexOf(value) === 0;
      },
    },
    {
      title: t("columns.created"),
      dataIndex: "created3",
      sorter: (x, y) => x.created2 - y.created2,
      // eslint-disable-next-line react/display-name
      render: function (props) {
        return (
          <>
            <span
              className={isfa ? "PersianNo" : ""}
              dangerouslySetInnerHTML={{ __html: props }}
            ></span>
          </>
        );
      },
    },
    {
      title: t("columns.req"),
      dataIndex: "requester",
      // eslint-disable-next-line react/display-name
      render: (text) => (
        <a className="color-register" href={"./profile"}>
          {text}
        </a>
      ),
    },
    {
      title: t("columns.updated"),
      dataIndex: "updated3",
      sorter: (a, b) => a.updated2 - b.updated2,
      // eslint-disable-next-line react/display-name
      render: function (props) {
        return (
          <>
            <span
              className={isfa ? "PersianNo" : ""}
              dangerouslySetInnerHTML={{ __html: props }}
            ></span>
          </>
        );
      },
    },
    {
      title: t("columns.action"),
      dataIndex: "action",
      // eslint-disable-next-line react/display-name
      render: function (id, record) {
        return (
          <>
            <Space size="middle" style={{ color: "#3699FF" }}>
              <Popconfirm
                title={t("message.confirm-done")}
                okText={t("message.yes")}
                cancelText={t("message.no")}
                onConfirm={() => {
                  deletTicket(record.key);
                }}
                className="color-red PersianNo"
              >
                <a>
                  {t("action.done")} {record.name}
                </a>
              </Popconfirm>
              <a
                onClick={() => {
                  openTicketfunc(record.key);
                }}
                className="color-orange PersianNo"
              >
                {t("action.open")}
              </a>
              {archive ? (
                <a
                  onClick={() => {
                    addArchive(record.key);
                  }}
                  className="color-blue PersianNo"
                >
                  {t("action.archive")}
                </a>
              ) : (
                ""
              )}
            </Space>
          </>
        );
      },
    },
  ];

  if (localStorage.getItem("admin") == 0) {
    columns.splice(6, 1);
  }

  var arr = [];
  useEffect(async () => {

    // tickets
    let url2 = url; 
    if(url.split("?")[1] != undefined){ // 0 = url, 1 = count , 2 = page
      url2 = url2 + "&count=" + range
    }
    else{
      url2 = url + "?count=" + range;
    }
    await axios
      .get(url2)
      .then((res) => {
        if (res.status === 200) {
          return res.data;
        } else {
          message.error(t("message.fail"));
        }
      })
      .then((result) => {
        setcurentData(result.total);
        return result.data;
      })
      .then((result) => {
        arr = [];
        const resul = [...result];
        axios
       .get("api/userslist?count=10000").then((results)=>{
         resul.map(async(val) => {
          let req = await results.data.data.find((value)=> {
            return value.id == val.user_id;
          })
          var creat_time = isfa==false ? moment(val.created_at).format("YYYY/M/D <br/> H:m:s") : moment(val.created_at).locale("fa").format("YYYY/M/D <br/> H:m:s")
          var update_time = isfa==false ? moment(val.updated_at).format("YYYY/M/D <br/> H:m:s") : moment(val.updated_at).locale("fa").format("YYYY/M/D <br/> H:m:s")
          arr.push({
            key: val.id,
            priority:
              val.priority == "critical"
                ? "Critical"
                : val.priority == "normal"
                ? "Normal"
                : "Urgent",
            type: val.type == 0 ? "Issue" : "Task",
            status: [val.status],
            number: val.id,
            subject: val.subject,
            requester: req.first_name + " " + req.last_name,
            created2: +new Date(
              val.created_at.split(".")[0].split("T").join("\n")
            ),
            created3: creat_time,
            updated2: +new Date(
              val.updated_at.split(".")[0].split("T").join("\n")
            ),
            updated3: update_time,
          });
        });
        return result;
       })
       .then(() => {
         setdata1(arr);
       })
      })
      .catch(() => {
        message.error(t("message.operation"));
      });
  }, [chnage,isfa]);

  let openTicketElem = openTicketTime ? (
    <OpenTicket
      deletTicket={deletTicket}
      data={idTiketOpen}
      comments={commentTicket}
      open={openTicket}
      changeComment={() => {
        setchange((prev) => !prev);
        openTicketfunc(idTiketOpen.key);
      }}
      hidefunc={() => {
        setOpenTicket(false); // close
        setTimeout(() => {
          setOpenTicketTime(false);
        }, 500); // show animationally closing
      }}
    />
  ) : (
    ""
  );
  const location = useLocation().pathname.split("/")[1];
  if (seeOpenTicket) {
    if (location !== "" && location !== null && location !== undefined) {
      if (data1[0] !== undefined) {
        setseeOpenTicket(false);
        openTicketfunc(location);
      }
    }
  }

  const onSearch = debounce((value) => {
    if (value.target.value.trim() !== "") {
      seturl("api/ticket?subject=" + value.target.value);
      setchange((prev) => !prev);
    } else if (value.target.value.trim() === "") {
      seturl("api/ticket");
      setchange((prev) => !prev);
    }
  }, 500);

  const changePage = (curent) => {
    const urlArchive = archive ? "ticket/" : "ticketarchive/";
    seturl(`api/${urlArchive}?page=${curent}`);
    setchange((prev) => !prev);
  };
  const textArchive = archive ? t("action.archived") : t("action.total");

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <li onClick={() => changeLanguage("en")}>
          <img src={English} alt="English" />
          {t("footer.english")}
        </li>
      </Menu.Item>
      <Menu.Item key="2">
        <li onClick={() => changeLanguage("fa")}>
          <img src={Persian} alt="Persian" />
          {t("footer.persian")}
        </li>
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Helmet>
        <title>{t("title.dashboard")}</title>
      </Helmet>
      <Layout className="layout">
        <Header>
          <Head
            changeTicket={() => {
              setchange((prev) => !prev); //toggle to open or close it
            }}
          />
        </Header>

        <Content className={isfa ? "rtl-content " : "ltr-content"}>
          {/* <Breadcrumb style={{ margin: "16px 0" }}> */}
            <Row wrap={false} className="display" style={{ margin: "16px 0" }}>
              <Col flex="none">
                <div>
                  <Button type="dashed" onClick={() => showArchive()} className="arshive-btn">
                    {textArchive}
                  </Button>
                </div>
              </Col>
              <Col className="right_information">
                <div className="search-table">

                  <div className="slider">
                    <Slider
                      defaultValue={range}
                      min={1}
                      max={10}
                      width="20px"
                      onChange= {rangeFunc}
                    />
                  </div>

                  <Search
                    onChange={(e) => onSearch(e)}
                    style={{
                      width: 200,
                      height: 30,
                      marginRight: "20px",
                      paddingLeft: "20px",
                      marginBottom:"10px"
                    }}
                  />

                  <Pagination
                    defaultCurrent={1}
                    onChange={changePage}
                    total={curentData}
                    pageSize = {range}
                    style={{marginBottom:"10px"}}
                  />
                </div>
              </Col>
            </Row>
          {/* </Breadcrumb> */}
          <div className="site-layout-content">
            <Table
              columns={columns}
              dataSource={data1}
              scroll={{ x: "calc(650px + 50%)" }}
            />
          </div>
        </Content>
        {openTicketElem}

        {/* bilingual */}
        <Footer style={{ textAlign: "center" }}>
          <Dropdown overlay={menu} placement="bottomCenter" arrow>
            <Button className="btn-footer">
              <img src={chooselanguage} alt="Choose Language" />
              {t("footer.language")}
            </Button>
          </Dropdown>
        </Footer>
      </Layout>
    </>
  );
}

export default Home;
