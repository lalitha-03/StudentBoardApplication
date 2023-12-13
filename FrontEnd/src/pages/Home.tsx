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

export default function Home() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("Courses");
  const [popUp, setPopup] = useState(false);

  const [loader, setLoader] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);

  const courses = useSelector((state: RootState) => state.course.courses);
  const assignments = useSelector(
    (state: RootState) => state.assignment.assignments
  );
  const library = useSelector((state: RootState) => state.library.library);

  const dispatch = useDispatch<AppDispatch>();

  const [aDescription, setADescription] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

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

  const handleAssignmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAssignmentFile(event.target.files[0]);
    }
  };

  const logout = () => {
    localStorage.clear();
    dispatch(clearUser());
    navigate("/login");
  };

  const clearDataSuccess = (msg: string) => {
    toast.success(msg);
    setADescription("");
    setAssignmentFile(null);
    setPopup(false);
    setLoader(false);
  };

  const clearDataFailed = (msg: string) => {
    toast.error(msg);
    setLoader(false);
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

  const enroll = async (courseId: string) => {
    setLoader(true);
    await DataService.enroll(courseId)
      .then((response) => {
        toast.success(response?.msg);
        setLoader(false);
        dispatch(getCourseData());
      })
      .catch((err) => {
        setLoader(false);
        toast.warn(err?.message);
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
          setSubmission(response?.data?.[0]);
        }
      })
      .catch((err) => {
        toast.warn(err?.message);
      });
  };

  const submitAssignment = async (event: any) => {
    event.preventDefault();
    setLoader(true);
    const formData = new FormData();
    formData.append("instructions", aDescription);
    formData.append("assignmentId", assignment?._id);
    if (assignmentFile) {
      formData.append("document", assignmentFile);
    }
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    await DataService.submitAssignment(formData)
      .then((response) => {
        clearDataSuccess(response?.msg);
        dispatch(getAssignmentData());
      })
      .catch((err) => {
        console.log(err);
        clearDataFailed(err?.message);
      });
  };

  return (
    <>
      {loader && <div className="loader">Loading...</div>}

      {popUp && (
        <div className="pop-up">
          {
            <div className="modal center-col-between">
              <div className="center-between">
                <div className="p-30">
                  <p className="subtitle mb-sm">{assignment?.name}</p>
                  <p>
                    <b>Course : </b>
                    {assignment?.course?.name}
                  </p>
                  <p className="mb-sm">
                    <b>Max Marks : </b>
                    {assignment?.marks}
                  </p>
                  <p className="w-280 h-100 overflow-y-auto p-10 bg-primary mb-md">
                    <b>Instruction : </b>
                    {assignment?.instructions}
                  </p>
                  <button
                    className="add-btn w-280"
                    onClick={() => downloadAssignment(assignment?._id)}
                  >
                    Download Assignment
                  </button>
                </div>

                {!submission ? (
                  <form
                    onSubmit={submitAssignment}
                    className="p-30 center-col-start"
                  >
                    <p className="subtitle mb-md">Submission</p>
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
                      type="file"
                      placeholder="Assignment"
                      onChange={handleAssignmentChange}
                      className="text-input mb-md"
                    />
                    <button type="submit" className="button mb-sm">
                      Submit Assignment
                    </button>
                  </form>
                ) : (
                  <div className="p-30">
                    <p className="subtitle mb-sm">Your Submission</p>
                    {!submission?.marks && submission?.marks !== 0 && (
                      <p className="mb-sm label">UNDER REVIEW</p>
                    )}
                    {submission?.marks > 0 && (
                      <p>
                        <b>Your Mark : </b>
                        {submission?.marks}/{assignment.marks}
                      </p>
                    )}
                    {submission?.remarks && (
                      <p className="mb-sm">
                        <b>Remarks : </b>
                        {submission?.remarks}
                      </p>
                    )}
                    <p className="w-280 h-100 overflow-y-auto mb-md p-10 bg-primary">
                      <b>Instruction :</b>
                      {submission?.instructions}
                    </p>
                    <button
                      className="add-btn w-280"
                      onClick={() => downloadSubmission(submission?._id)}
                    >
                      Download Submission
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setPopup(false);
                  setAssignment(null);
                  setSubmission(null);
                }}
                className="close-button"
              >
                Close
              </button>
            </div>
          }
        </div>
      )}
      <div className="full">
        <div className="h-10 w-full px-lg light center-between">
          <p className="title">Black Board</p>

          <div className="center">
            <p onClick={() => setScreen("Courses")} className="link pr-md">
              Courses
            </p>
            <p onClick={() => setScreen("Library")} className="link pr-md">
              Library
            </p>
            <p onClick={() => setScreen("Assignments")} className="link pr-md">
              Assignments
            </p>
            <p onClick={logout} className="add-btn">
              Logout
            </p>
          </div>
        </div>

        <div className="h-10 w-full center">
          <p className="subtitle">{screen}</p>
        </div>

        {screen === "Courses" && (
          <div className="w-full px-lg grid">
            {courses.map((course: any) => {
              return (
                <div key={course?.name} className="v-card">
                  <img
                    alt="Course"
                    src="https://images.unsplash.com/photo-1661956601349-f61c959a8fd4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                  />
                  <div className="v-card-body">
                    <p>Name: {course?.name}</p>
                    <p className="mb-md">Description: {course?.description}</p>
                    <div className="center-between">
                      <button
                        className="add-book-btn"
                        onClick={() => downloadCourse(course?._id)}
                      >
                        Download syllabus
                      </button>
                      <button
                        className={
                          course.isEnrolled
                            ? "add-book-btn-inactive"
                            : "add-book-btn"
                        }
                        onClick={() =>
                          !course.isEnrolled && enroll(course?._id)
                        }
                      >
                        {course.isEnrolled ? "Enrolled" : "Enroll"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {screen === "Library" && (
          <div className="w-full px-lg grid">
            {library.map((book: any) => {
              return (
                <div key={book?.name} className="h-card">
                  <div className="h-card-body">
                    <p>Book Name: {book?.name}</p>
                    <p>Author: {book?.author}</p>
                    <p className="mb-sm">Course: {book?.course?.name}</p>
                    <button
                      className="download-btn"
                      onClick={() => downloadBook(book?._id)}
                    >
                      Download Book
                    </button>
                  </div>
                  <img
                    alt="Book Cover"
                    src="https://images.unsplash.com/photo-1661956601349-f61c959a8fd4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                  />
                </div>
              );
            })}
          </div>
        )}

        {screen === "Assignments" && (
          <div className="w-full px-lg grid">
            {assignments.map((assignment: any) => {
              return (
                <div
                  onClick={() => openAssignment(assignment)}
                  key={assignment?.name}
                  className="v-card"
                >
                  <img
                    alt="Assignment"
                    src="https://images.unsplash.com/photo-1661956601349-f61c959a8fd4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                  />
                  <div className="v-card-body">
                    <b>{assignment?.name}</b>
                    <p>Course: {assignment?.course?.name}</p>
                    {/* <p className='mb-sm'>Marks: {assignment?.marks}</p>
                                <div className='center-between'>
                                    <button className='add-btn' onClick={() => downloadAssignment(assignment?._id)} >Download assignment</button>
                                    <button className={assignment?.marks === 0 ? 'add-book-btn-inactive' : 'add-book-btn'} onClick={() => !assignment?.isEnrolled && enroll(assignment?._id)} >{assignment?.marks === 0 ? 'Submitted' : 'Submit'}</button>
                                </div> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer position="bottom-center" />
    </>
  );
}
