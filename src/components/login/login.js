import "./login.css";
import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import {
  Layout,
  message,
  Row,
  Col,
  Form,
  Input,
  Button,
  Checkbox,
  Dropdown,
  Menu,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import imgLogin from "../../assets/sign-in.png";
import imagelogin from "../../assets/sama.svg";
import { Helmet } from "react-helmet";
import axios from "../../axios";
import { useTranslation } from "react-i18next";
import English from "../../assets/english.svg";
import Persian from "../../assets/persian.svg";
import chooselanguage from "../../assets/chooselanguage.svg";
import i18n from "../../utilies/i18n";

const { Content } = Layout;

function Login() {
  const [check, setcheck] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // change direrction persian -> rtl / english -> ltr
  };

  const [isfa, setfa] = useState(false);
  const Detectfa = (lng) => {
    if (lng === "fa") setfa(true);
    else setfa(false);
  };

  i18n.on("languageChanged", (lng) => {
    Detectfa(lng);
  });

  useEffect(() => {
    if (i18n.language == "fa") {
      setfa(true);
    } else {
      setfa(false);
    }
  }, []);

  const storage = localStorage.getItem("login");
  useEffect(() => {
    const storageObj = JSON.parse(storage);
    if (storage !== null) {
      form.setFieldsValue({
        email: storageObj.email,
        password: storageObj.password,
      });
    }
  }, []);
  const history = useHistory();
  const handleFormSubmit = (values) => {
    const email = values.email,
      pass = values.password;
    axios
      .post("api/login/", {
        email: email,
        password: pass,
      })
      .then((res) => {
        if (res.status === 200) {
          if (check === true) {
            localStorage.setItem(
              "login",
              JSON.stringify({
                // change object to json
                email: email,
                password: pass,
              })
            );
          }
          return res.data;
        }
        else{
          message.error(t("message.invalid-login"));
        }
      })
    
      .then((res) => {
        localStorage.setItem("auth", "true");
        localStorage.setItem("token", res.token);
        localStorage.setItem("id", res.id);
        localStorage.setItem("admin", res.admin);
        localStorage.setItem("username", res.name);
        history.replace("/dashboard");
      })
      .catch(() => {
        message.error(t("message.invalid-login"));
      });
  };

  const register = () => {
    message.warn(t("message.joinUs"));
    history.push("/register");
  };
  const forgotpass = () => {
    message.success(t("message.forgotten"));
    history.push("./forgot");
  };

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
        <title>{t("title.login")}</title>
      </Helmet>

      <Layout>
        <Content className={isfa ? "rtl-login__layout" : "ltr-login__layout"}>
          <Row>
            <Col className="item_center" span={12}>
              <div>
                <img src={imagelogin} className="imglogo " alt="" />
              </div>
              <p className="p-size">{t("login.welcome")}</p>

              <Form
                name="normal_login"
                className="login-form"
                form={form}
                initialValues={{
                  remember: true,
                }}
                onFinish={handleFormSubmit}
              >
                <div className="flex-space">
                  <Form.Item
                    className="ant-input-size"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: t("message.input-email"),
                      },
                      {
                        type: "email",
                        message: t("message.invalid"),
                      },
                    ]}
                  >
                    <Input
                      prefix={
                        <MailOutlined className="ant-icon site-form-item-icon " />
                      }
                      placeholder={t("password.email")}
                    />
                  </Form.Item>
                  <Form.Item
                    className="ant-input-size"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: t("message.password"),
                      },
                      {
                        min: 8,
                        message: t("message.password-limit"),
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <LockOutlined className="ant-icon site-form-item-icon" />
                      }
                      type="password"
                      placeholder={t("password.password")}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      // type="primary"
                      htmlType="submit"
                      className="login-form-button submit-login"
                    >
                      {t("page.login")}
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <div className="width-style">
                      <Form.Item name="remember" noStyle>
                        <Checkbox
                          onChange={(e) => {
                            setcheck(e.target.checked);
                          }}
                          className={isfa ? "rtl-remember" : "ltr-remember"}
                          style={{ fontSize: "13.5px" }}
                        >
                          {t("login.remember")}
                        </Checkbox>
                      </Form.Item>
                      <a
                        className={isfa ? "rtl-forgot" : "ltr-forgot"}
                        onClick={forgotpass}
                        style={{ fontSize: "13px" }}
                      >
                        {t("login.forgot")}
                      </a>
                    </div>
                  </Form.Item>
                  <Form.Item className="botoom-border">
                    {t("links.way")}
                    {"  "}
                    <a className="a-style" onClick={register}>
                      {t("links.register")}
                    </a>
                    <br />
                    {t("links.issue")}{" "}
                    <Link className="a-style" to={"./guide"}>
                      {t("links.contact")}
                    </Link>
                  </Form.Item>
                  {/* Bilingual */}
                  <Dropdown overlay={menu} placement="bottomCenter" arrow>
                    <Button
                      className="btn-footer"
                      style={{ marginBottom: "20px" }}
                    >
                      <img src={chooselanguage} alt="Choose Language" />
                      {t("footer.language")}
                    </Button>
                  </Dropdown>
                </div>
              </Form>
            </Col>
            <Col className="login__right-image" span={12}>
              <div>
                <img
                  src={imgLogin}
                  className="grayscale loginImag"
                  width="100%"
                  height="721vh"
                  alt=""
                />

                <p
                  className="para"
                  style={{ color: "blue", padding: "25px 0px" }}
                >
                  <span style={{ color: "blue", fontWeight: "500" }}>
                    {t("company.company")}
                  </span>
                </p>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
}

export default Login;
