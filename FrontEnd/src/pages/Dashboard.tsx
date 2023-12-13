import { ChangeEvent, useEffect, useState } from "react";
import { getCourseData } from "../slices/courseSlice";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../slices/authSlice";
import { getAssignmentData } from "../slices/assignmentSlice";
import { getLibraryData } from "../slices/librarySlice";
import { DataService } from "../services/dataservice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("Courses");
  const [popUp, setPopup] = useState(false);
  const [loader, setLoader] = useState(false);

  const courses = useSelector((state: RootState) => state.course.courses);
  const assignments = useSelector(
    (state: RootState) => state.assignment.assignments
  );
  const library = useSelector((state: RootState) => state.library.library);

  const dispatch = useDispatch<AppDispatch>();

  const [cName, setCName] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [enrollmentLimit, setEnrollmentLimit] = useState("");
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);

  const [bookCurrentCourse, setBookCurrentCourse] = useState("");
  const [bName, setBName] = useState("");
  const [author, setAuthor] = useState("");
  const [bookFile, setBookFile] = useState<File | null>(null);

  const [aCurrentCourse, setACurrentCourse] = useState("");
  const [aName, setAName] = useState("");
  const [aDescription, setADescription] = useState("");
  const [marks, setMarks] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any>(null);

  const [submission, setSubmission] = useState<any>(null);

  const [sMarks, setSMarks] = useState("");
  const [remarks, setRemarks] = useState("");

  const user = localStorage.getItem("user");

  useEffect(() => {
    if (user) {
      dispatch(getCourseData());
      dispatch(getAssignmentData());
      dispatch(getLibraryData());
    } else {
      navigate("/login");
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user !== null) {
      const lsUser = JSON.parse(user);
      if (!lsUser) {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const logout = () => {
    localStorage.clear();
    dispatch(clearUser());
    navigate("/login");
  };

  const handleSyllabusChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSyllabusFile(event.target.files[0]);
    }
  };

  const handleBookChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setBookFile(event.target.files[0]);
    }
  };

  const handleAssignmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAssignmentFile(event.target.files[0]);
    }
  };

  const clearDataSuccess = (msg: string) => {
    toast.success(msg);
    setCName("");
    setCDescription("");
    setEnrollmentLimit("");
    setSyllabusFile(null);
    setBookCurrentCourse("");
    setBName("");
    setAuthor("");
    setBookFile(null);
    setAName("");
    setACurrentCourse("");
    setADescription("");
    setAssignmentFile(null);
    setMarks("");
    setPopup(false);
    setLoader(false);
  };

  const clearDataFailed = (msg: string) => {
    toast.error(msg);
    setLoader(false);
  };

  const addCourse = async (event: any) => {
    event.preventDefault();
    setLoader(true);
    const formData = new FormData();
    formData.append("name", cName);
    formData.append("description", cDescription);
    formData.append("enrollmentLimit", enrollmentLimit);
    if (syllabusFile) {
      formData.append("syllabus", syllabusFile);
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    await DataService.addCourse(formData)
      .then((response) => {
        clearDataSuccess(response?.msg);
        dispatch(getCourseData());
      })
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const deleteCourse = async (id: string) => {
    setLoader(true);
    await DataService.deleteCourse(id)
      .then((response) => {
        // console.log(response);
        clearDataSuccess(response?.msg);
        dispatch(getCourseData());
      })
      .catch((err) => {
        // console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const addBook = async (event: any) => {
    event.preventDefault();
    setLoader(true);
    const formData = new FormData();
    formData.append("name", bName);
    formData.append("author", author);
    formData.append("courseId", bookCurrentCourse);
    if (bookFile) {
      formData.append("book", bookFile);
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    await DataService.addBook(formData)
      .then((response) => {
        clearDataSuccess(response?.msg);
        dispatch(getLibraryData());
      })
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
    console.log(formData);
  };

  const deleteBook = async (id: string) => {
    setLoader(true);
    await DataService.deleteBook(id)
      .then((response) => {
        clearDataSuccess(response?.msg);
        dispatch(getLibraryData());
      })
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const addAssignment = async (event: any) => {
    event.preventDefault();
    setLoader(true);
    const formData = new FormData();
    formData.append("name", aName);
    formData.append("instructions", aDescription);
    formData.append("marks", marks);
    formData.append("courseId", aCurrentCourse);
    if (assignmentFile) {
      formData.append("document", assignmentFile);
    }
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    await DataService.addAssignment(formData)
      .then((response) => {
        clearDataSuccess(response?.msg);
        dispatch(getAssignmentData());
      })
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const downloadCourse = async (courseId: string) => {
    setLoader(true);
    await DataService.downloadCourse(courseId)
      .then(() => setLoader(false))
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const downloadBook = async (bookId: string) => {
    setLoader(true);
    await DataService.downloadBook(bookId)
      .then(() => setLoader(false))
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const downloadAssignment = async (assignmentId: string) => {
    setLoader(true);
    await DataService.downloadAssignment(assignmentId)
      .then(() => setLoader(false))
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const downloadSubmission = async (submissionId: string) => {
    setLoader(true);
    await DataService.downloadSubmisiion(submissionId)
      .then(() => setLoader(false))
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  const openAssignment = async (assignment: any) => {
    setLoader(true);
    setAssignment(assignment);
    await DataService.getSubmissions(assignment?._id)
      .then((response) => {
        console.log(response);
        setLoader(false);
        setPopup(true);
        if (response?.data?.length > 0) {
          setSubmissions(response?.data);
        }
      })
      .catch((err) => {
        toast.warn(err?.message);
        setLoader(false);
      });
  };

  const evaluate = async (event: any) => {
    event?.preventDefault();
    setLoader(true);
    let evaluateData = {
      marks: parseInt(sMarks),
      remarks: remarks,
    };
    console.log(evaluateData);
    await DataService.evaluate(evaluateData, submission?._id)
      .then((response) => {
        console.log(response);
        setLoader(false);
        setAssignment(null);
        setSubmission(null);
        clearDataSuccess(response?.msg);
        if (response?.data?.length > 0) {
          setSubmissions(response?.data);
        }
      })
      .catch((err) => {
        toast.warn(err?.message);
        setLoader(false);
      });
  };

  return (
    <>
      {loader && <div className="loader">Loading...</div>}
      {popUp && (
        <div className="pop-up">
          {/* ADD COURSE */}
          {screen === "Courses" &&
            bookCurrentCourse === "" &&
            aCurrentCourse === "" && (
              <form onSubmit={addCourse} className="modal center-col">
                <p className="mb-lg subtitle">Add Course</p>
                <input
                  required
                  type="text"
                  placeholder="Name"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="text"
                  placeholder="Description"
                  value={cDescription}
                  onChange={(e) => setCDescription(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="text"
                  placeholder="Enrollment Limit"
                  value={enrollmentLimit}
                  onChange={(e) => setEnrollmentLimit(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="file"
                  placeholder="Syllabus"
                  onChange={handleSyllabusChange}
                  className="text-input mb-md"
                />
                <button type="submit" className="button mb-sm">
                  Add Course
                </button>
                <button
                  onClick={() => {
                    setPopup(false);
                    setBookCurrentCourse("");
                    setACurrentCourse("");
                  }}
                  className="close-button"
                >
                  Close
                </button>
              </form>
            )}

          {/* ADD BOOK */}
          {screen === "Courses" &&
            bookCurrentCourse !== "" &&
            aCurrentCourse === "" && (
              <form onSubmit={addBook} className="modal center-col">
                <p className="mb-lg subtitle">Add Book</p>
                <input
                  required
                  type="text"
                  placeholder="Name"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="text"
                  placeholder="Author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="file"
                  placeholder="Book"
                  onChange={handleBookChange}
                  className="text-input mb-md"
                />
                <button type="submit" className="button mb-sm">
                  Add Book
                </button>
                <button
                  onClick={() => {
                    setPopup(false);
                    setBookCurrentCourse("");
                    setACurrentCourse("");
                  }}
                  className="close-button"
                >
                  Close
                </button>
              </form>
            )}

          {/* ADD ASSIGNMENT */}
          {screen === "Courses" &&
            aCurrentCourse !== "" &&
            bookCurrentCourse === "" && (
              <form onSubmit={addAssignment} className="modal center-col">
                <p className="mb-lg subtitle">Add Assignment</p>
                <input
                  required
                  type="text"
                  placeholder="Name"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  className="text-input mb-md"
                />
                <textarea
                  required
                  rows={5}
                  placeholder="Instructions"
                  value={aDescription}
                  onChange={(e) => setADescription(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="text"
                  placeholder="Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="text-input mb-md"
                />
                <input
                  required
                  type="file"
                  placeholder="Assignment"
                  onChange={handleAssignmentChange}
                  className="text-input mb-md"
                />
                <button type="submit" className="button mb-sm">
                  Add Assignment
                </button>
                <button
                  onClick={() => {
                    setPopup(false);
                    setBookCurrentCourse("");
                    setACurrentCourse("");
                  }}
                  className="close-button"
                >
                  Close
                </button>
              </form>
            )}

          {/* MODAL FOR ASSIGNMENT SUBMISSION */}
          {screen === "Assignments" && assignment && !submission && (
            <div className="modal center-col-between">
              <div className="center-start mb-md">
                <div className="center-col-start w-280 pl-lg mr-lg">
                  <p className="subtitle mb-sm">{assignment?.name}</p>
                  <p>
                    <b>Course : </b>
                    {assignment?.course?.name}
                  </p>
                  <p className="mb-sm">
                    <b>Max Marks : </b>
                    {assignment?.marks}
                  </p>
                  <p className="w-180 h-100 overflow-y-auto mb-md p-10 bg-primary">
                    <b>Instruction :</b>
                    {assignment?.instructions}
                  </p>
                  <button
                    className="add-btn mb-lg"
                    onClick={() => downloadAssignment(assignment?._id)}
                  >
                    Download Assignment
                  </button>
                </div>
                <div className="center-col-start w-500">
                  <p className="subtitle mb-md">Submissions</p>

                  <div className="center-col-start w-500 h-350 overflow-y-auto overflow-x-hidden pr-xlg">
                    {submissions?.length > 0 ? (
                      <>
                        {submissions?.map((submission: any) => {
                          return (
                            <div className="w-full center-between border-primary mb-sm">
                              <p>
                                {submission?.studentId?.firstName +
                                  " " +
                                  submission?.studentId?.lastName}
                              </p>
                              <button
                                className="add-btn"
                                onClick={() => setSubmission(submission)}
                              >
                                {!submission?.remarks
                                  ? "Evaluate"
                                  : "View Submission"}
                              </button>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div>No submissions yet.</div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPopup(false);
                  setAssignment(null);
                  setSubmissions(null);
                }}
                className="close-button"
              >
                Close
              </button>
            </div>
          )}

          {/* MODAL FOR ASSIGNMENT EVALUATE */}
          {screen === "Assignments" && assignment && submission && (
            <div className="modal center-col-between">
              <div className="center-between">
                <div className="p-30">
                  <p className="subtitle">{assignment?.name}</p>
                  <p>
                    <b>Student name : </b>
                    {submission?.studentId?.firstName +
                      " " +
                      submission?.studentId?.lastName}
                  </p>
                  {submission?.marks && submission?.marks > 0 ? (
                    <p>
                      <b>Marks : </b>
                      {submission?.marks}/{assignment?.marks}
                    </p>
                  ) : (
                    <p>
                      <b>Max Marks : </b>
                      {assignment?.marks}
                    </p>
                  )}
                  {submission?.remarks && (
                    <p>
                      <b>Remarks : </b>
                      {submission?.remarks}
                    </p>
                  )}
                  <p className="mb-sm">
                    <b>Course : </b>
                    {assignment?.course?.name}
                  </p>
                  <p className="w-280 h-100 overflow-y-auto mb-md p-10 bg-primary">
                    <b>Instruction :</b>
                    {submission?.instructions}
                  </p>
                  <button
                    className="add-btn w-280 mb-lg"
                    onClick={() => downloadSubmission(submission?._id)}
                  >
                    Download Assignment
                  </button>
                </div>

                {!submission?.remarks && (
                  <form className="center-col p-30" onSubmit={evaluate}>
                    <p className="subtitle mb-md">Evaluate</p>
                    <input
                      required
                      type="text"
                      placeholder="Marks"
                      value={sMarks}
                      onChange={(e) => setSMarks(e.target.value)}
                      className="text-input mb-sm"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="text-input mb-md"
                    />
                    <button type="submit" className="button mb-sm">
                      Evaluate
                    </button>
                  </form>
                )}
              </div>
              <button
                onClick={() => {
                  setSubmission(null);
                }}
                className="close-button"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Page */}
      <div className="full center overflow-y-hidden">
        <div className="side-navbar">
          <p className="title">BlackBoard</p>
          <br></br>
          <p
            className={
              screen === "Courses" ? "side-nav-link-active" : "side-nav-link"
            }
            onClick={() => setScreen("Courses")}
          >
            Courses
          </p>
          <p
            className={
              screen === "Library" ? "side-nav-link-active" : "side-nav-link"
            }
            onClick={() => setScreen("Library")}
          >
            Library
          </p>
          <p
            className={
              screen === "Assignments"
                ? "side-nav-link-active mb-md"
                : "side-nav-link mb-md"
            }
            onClick={() => setScreen("Assignments")}
          >
            Assignments
          </p>
          <p className="logout-btn" onClick={logout}>
            Logout
          </p>
        </div>

        <div className="w-rem h-full overflow-y-auto p-30">
          <div className="h-10 w-full center-between px-md">
            <p className="subtitle">{screen}</p>

            {screen === "Courses" && (
              <button onClick={() => setPopup(true)} className="add-btn">
                {" "}
                + Add Course
              </button>
            )}
            {/* {screen === "Library" && <button onClick={() => setPopup(true)} className='add-btn'> + Add Book</button>}
                        {screen === "Assignments" && <button onClick={() => setPopup(true)} className='add-btn'> + Add Assignment</button>} */}
          </div>
          {screen === "Courses" && courses?.length > 0 ? (
            <div className="w-full px-md grid">
              {courses.map((course: any) => {
                return (
                  <div key={course?.name} className="v-card">
                    <img
                      alt="Course"
                      src="https://wallpapercave.com/wp/wp8149811.jpg"
                    />
                    <div className="v-card-body">
                      <p>Name: {course?.name}</p>
                      <p>Description: {course?.description}</p>
                      <p>Enrolled: {course?.enrolled}</p>
                      <p className="mb-sm">
                        Enrollment Limit: {course?.enrollmentLimit}
                      </p>

                      <div className="center-between mb-sm">
                        <button
                          className="add-book-btn"
                          onClick={() => {
                            setBookCurrentCourse(course?._id);
                            setPopup(true);
                          }}
                        >
                          Add Book
                        </button>
                        <button
                          className="add-book-btn"
                          onClick={() => {
                            setACurrentCourse(course?._id);
                            setPopup(true);
                          }}
                        >
                          Add Assignment
                        </button>
                      </div>
                      <button
                        className="download-btn"
                        onClick={() => downloadCourse(course?._id)}
                      >
                        Download syllabus
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteCourse(course?._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            screen === "Courses" && (
              <p className="w-full center">No Courses Added</p>
            )
          )}

          {screen === "Library" && library?.length > 0 ? (
            <div className="w-full px-md grid">
              {library.map((book: any) => {
                return (
                  <div key={book?.name} className="h-card">
                    <div className="h-card-body">
                      <p>Book Name: {book?.name}</p>
                      <p>Author: {book?.author}</p>
                      <p className="mb-sm">Course: {book?.course?.name}</p>
                      <button
                        className="delete-btn"
                        onClick={() => deleteBook(book?._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="download-btn"
                        onClick={() => downloadBook(book?._id)}
                      >
                        Download Book
                      </button>
                    </div>
                    <img
                      alt="Book Cover"
                      src="https://wallpapercave.com/wp/wp8149811.jpg"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            screen === "Library" && (
              <p className="w-full center">No Books Added</p>
            )
          )}

          {screen === "Assignments" && assignments?.length > 0 ? (
            <div className="w-full px-md grid">
              {assignments.map((assignment: any) => {
                return (
                  <div
                    onClick={() => openAssignment(assignment)}
                    key={assignment?.name}
                    className="v-card"
                  >
                    <img
                      alt="Assignment"
                      src="https://wallpapercave.com/wp/wp8149811.jpg"
                    />
                    <div className="v-card-body">
                      <b>{assignment?.name}</b>
                      <p>Course: {assignment?.course?.name}</p>
                      {/* <p className='mb-sm'>Marks: {assignment?.marks}</p>
                                    <button className='download-btn' onClick={() => downloadAssignment(assignment?._id)} >Download assignment</button> */}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            screen === "Assignments" && (
              <p className="w-full center">No Assignments Added</p>
            )
          )}
        </div>
      </div>

      <ToastContainer position="bottom-center" />
    </>
  );
}
