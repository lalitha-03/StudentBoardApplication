import React from "react";
import { URLS } from "../constants";

export class DataService extends React.Component {
  static async loginService(data: any) {
    try {
      const response = await fetch(`${URLS.LOGIN_URL}${data?.usertype}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data?.email,
          password: data?.password,
        }),
      });
      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 422) {
          throw new Error(err?.msg);
        } else {
          throw new Error("Something went wrong");
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async registerService(data: any) {
    try {
      const response = await fetch(URLS.REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 422) {
          throw new Error(err?.msg);
        } else {
          throw new Error("Something went wrong");
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async getCourses() {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");

    try {
      const response = await fetch(URLS.COURSE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.token,
        },
      });

      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 401) {
          localStorage.clear();
        }
        throw new Error(err?.msg);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async addCourse(formData: FormData) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(URLS.COURSE_URL, {
      method: "POST",
      headers: {
        Authorization: userData?.token,
      },
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          let err = await response.json();
          console.log(err);
          if (response.status === 401) {
            localStorage.clear();
          }
          throw new Error(err?.msg);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async deleteCourse(courseId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.COURSE_URL}/${courseId}`, {
      method: "DELETE",
      headers: {
        Authorization: userData?.token,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          let err = await response.json();
          console.log(err);
          if (response.status === 401) {
            localStorage.clear();
          }
          throw new Error(err?.msg);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async downloadCourse(courseId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.COURSE_DOWNLOAD_URL}${courseId}`, {
      method: "GET",
      headers: {
        Authorization: userData?.token,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "syllabus.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async getBooks() {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    try {
      const response = await fetch(URLS.LIBRARY_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.token,
        },
      });

      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 401) {
          localStorage.clear();
        }
        throw new Error(err?.msg);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async addBook(formData: FormData) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(URLS.LIBRARY_URL, {
      method: "POST",
      headers: {
        Authorization: userData?.token,
      },
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          let err = await response.json();
          console.log(err);
          if (response.status === 401) {
            localStorage.clear();
          }
          throw new Error(err?.msg);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async deleteBook(bookId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.LIBRARY_URL}/${bookId}`, {
      method: "DELETE",
      headers: {
        Authorization: userData?.token,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          let err = await response.json();
          console.log(err);
          if (response.status === 401) {
            localStorage.clear();
          }
          throw new Error(err?.msg);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async downloadBook(bookId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.BOOK_DOWNLOAD_URL}${bookId}`, {
      method: "GET",
      headers: {
        Authorization: userData?.token,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        console.log(url, "269");

        const a = document.createElement("a");
        a.href = url;
        a.download = "Book.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async getAssignments() {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    try {
      const response = await fetch(URLS.ASSIGNMENT_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.token,
        },
      });

      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 401) {
          localStorage.clear();
        }
        throw new Error(err?.msg);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async addAssignment(formData: FormData) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(URLS.ASSIGNMENT_URL, {
      method: "POST",
      headers: {
        Authorization: userData?.token,
      },
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          let err = await response.json();
          console.log(err);
          if (response.status === 401) {
            localStorage.clear();
          }
          throw new Error(err?.msg);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async downloadAssignment(assignmentId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.ASSIGNMENT_DOWNLOAD_URL}${assignmentId}`, {
      method: "GET",
      headers: {
        Authorization: userData?.token,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "assignment.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async enroll(courseId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    try {
      const response = await fetch(`${URLS.ENROLL_URL}${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.token,
        },
      });

      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 401) {
          localStorage.clear();
        }
        throw new Error(err?.msg);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async getSubmissions(assignmentId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    try {
      const response = await fetch(`${URLS.SUBMISSION_URL}${assignmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.token,
        },
      });

      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 401) {
          localStorage.clear();
        }
        throw new Error(err?.msg);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async submitAssignment(formData: FormData) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    console.log(lsUser, "406");
    console.log(userData, "407");

    try {
      const response = await fetch(`${URLS.SUBMISSION_URL}`, {
        method: "POST",
        headers: {
          Authorization: userData?.token,
        },
        body: formData,
      });

      if (!response.ok) {
        let err = await response.json();
        console.log(err);
        if (response.status === 401) {
          localStorage.clear();
        }
        throw new Error(err?.msg);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  static async downloadSubmisiion(submissionId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.SUBMISSION_DOWNLOAD_URL}${submissionId}`, {
      method: "GET",
      headers: {
        Authorization: userData?.token,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "submission.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }

  static async evaluate(evaluateData: any, submissionId: string) {
    const lsUser = localStorage.getItem("user");
    const userData = JSON.parse(lsUser || "");
    return fetch(`${URLS.SUBMISSION_URL}${submissionId}`, {
      method: "PUT",
      headers: {
        Authorization: userData?.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evaluateData),
    })
      .then(async (response) => {
        if (!response.ok) {
          let err = await response.json();
          console.log(err);
          if (response.status === 401) {
            localStorage.clear();
          }
          throw new Error(err?.msg);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  }
}
