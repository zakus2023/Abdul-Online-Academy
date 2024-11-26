import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxios from "../utils/useAxios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import UserData from "../views/plugin/UserData";
import Toast from "../views/plugin/Toast";
import { parseInt } from "yet-another-react-lightbox";

function CourseEdit() {
  const [course, setCourse] = useState({
    category: 0,
    file: "",
    image: "",
    title: "",
    description: "",
    price: "",
    level: "",
    language: "",
    teacher_course_status: "",
  });

  const [category, setCategory] = useState([]);

  const [progress, setProgress] = useState(0);

  const [ckEditorData, setCKEditorData] = useState("");

  const [variants, setVariants] = useState([
    {
      title: "",
      items: [{ title: "", description: "", file: "", preview: false }],
    },
  ]);

  console.log("variant==>", variants);
  const param = useParams();

  const fetchCourseDetail = () => {
    useAxios()
      .get(`course/category/`)
      .then((res) => {
        setCategory(res.data);
      });

    useAxios()
      .get(`teacher/course-detail/${param.course_id}/`)
      .then((res) => {
        setCourse(res.data);
        setVariants(res.data.curricullum);
        setCKEditorData(res.data.description);
      });
  };

  useEffect(() => {
    fetchCourseDetail();
  }, []);
  console.log(course);

  // Input change handlers/ event handlers

  const handlecourseInputChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
    console.log(data);
  };

  const handleCourseImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourse({
          ...course,
          image: {
            file: e.target.files[0],
            preview: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCourseIntroVideoChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleVariantOnChange = (variantIndex, propertyName, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex][propertyName] = value;
    setVariants(updatedVariants);
    console.log(
      `Name: ${propertyName}-Value: ${value} - Index: ${variantIndex}`
    );
    console.log(variants);
  };

  const handleVariantItemChange = (
    variantItemIndex,
    variantIndex,
    propertyName,
    value,
    type
  ) => {
    const updatedVariants = [...variants];

    // Check if the property is a file type
    if (type === "file") {
      // Store the file object
      updatedVariants[variantIndex].items[variantItemIndex][propertyName] =
        value instanceof File ? value : null;
    } else {
      // Handle other input types (e.g., text, number, etc.)
      updatedVariants[variantIndex].items[variantItemIndex][propertyName] =
        value;
    }
    setVariants(updatedVariants);
    console.log(
      `Name: ${propertyName} - Value: ${value} - Type: ${type} - Index: ${variantItemIndex} - VariantIndex: ${variantIndex}`
    );
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: "",
        items: [{ title: "", description: "", file: "", preview: false }],
      },
    ]);
  };

  const removeVariant = async (variantIndex, variantId) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(variantIndex, 1);
    setVariants(updatedVariants);

    try {
      const res = await useAxios().delete(
        `teacher/course-variant-delete/${UserData()?.teacher_id}/${variantId}/${param.course_id}/`
      );
      console.log(res.data);
      Toast().fire({
        title: "Topic deleted Successfully",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });
      fetchCourseDetail();
    } catch (error) {
      console.error("Error deleting variant:", error);
      Toast().fire({
        title: "Failed to delete topic",
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const addVariantItem = (variantItemIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantItemIndex].items.push({
      title: "",
      description: "",
      file: "",
      preview: false,
    });
    setVariants(updatedVariants);
  };

  const removeVariantItem = async (
    variantItemIndex,
    itemIndex,
    variantId,
    variantItemId
  ) => {
    // Optimistically update the UI
    const updatedVariants = [...variants];
    updatedVariants[variantItemIndex].items.splice(itemIndex, 1);
    setVariants(updatedVariants);

    try {
      // Make the API request
      const response = await useAxios().delete(
        `teacher/course-variant-item-delete/${UserData()?.teacher_id}/${variantId}/${variantItemId}/${param.course_id}/`
      );

      // On success, show a toast
      console.log(response.data); // Log the response for debugging
      Toast().fire({
        title: "Sub-Topic deleted Successfully",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
      });

      // Fetch the course details after the successful delete
      fetchCourseDetail();
    } catch (error) {
      // Handle the error gracefully
      console.error("Error deleting variant item:", error);
      Toast().fire({
        title: "Error deleting Sub-Topic",
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

 

  const handleSubmitCourse = async (e) => {
    e.preventDefault();

    // Fetch existing data for comparison
    const existingData = await useAxios().get(
      `teacher/course-detail/${param.course_id}/`
    );

    const formData = new FormData();

    // Append main course fields, including title, description, etc.
    formData.append("title", course.title);
    formData.append("description", ckEditorData);

    // Handle category
    const categoryId = course.category?.id || course.category;
    formData.append("category", parseInt(categoryId));

    formData.append("price", course.price);
    formData.append("level", course.level);
    formData.append("language", course.language);
    formData.append("teacher_course_status", course.teacher_course_status);
    formData.append("teacher", parseInt(UserData()?.teacher_id));
    formData.append("teacher_course_status", course.teacher_course_status)

    // Validate and append image if it's different
    if (course.image?.file && course.image.file !== existingData.data.image) {
      formData.append("image", course.image.file);
    }

    // Validate and append the course file if it's different
    if (course.file instanceof File && course.file !== existingData.data.file) {
      formData.append("file", course.file);
    } else if (
      typeof course.file === "string" &&
      course.file !== existingData.data.file
    ) {
      // If the file is a URL, append it if it differs from the existing one
      formData.append("file", course.file);
    }

    // Validate and append variants and items


     //Add the variant/topics
    variants.forEach((variant, variantIndex) => {
      Object.entries(variant).forEach(([key, value]) => {
        console.log(`key: ${key} - value: ${value}`);
        formData.append(
          `variants[${variantIndex}][variant_${key}]`,
          String(value)
        );
      });
      // Add the variant Items/subtopics
      variant.items.forEach((item, itemIndex) => {
        Object.entries(item).forEach(([itemKey, itemValue]) => {
          formData.append(
            `variants[${variantIndex}][items][${itemIndex}][${itemKey}]`,
            itemValue
          );
        });
      });
    });
    

    try {
      const response = await useAxios().patch(
        `teacher/update-course/${UserData()?.teacher_id}/${param.course_id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Course updated successfully:", response.data);
        Toast().fire({
          title: "Course updated successfully!",
          icon: "success",
          timer: 3000,
          timerProgressBar: true,
        });
        fetchCourseDetail();
      }
    } catch (error) {
      console.error("Error updating course:", error.response?.data || error);
      Toast().fire({
        title: "Error updating course",
        icon: "error",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <form
              onSubmit={handleSubmitCourse}
              className="col-lg-9 col-md-8 col-12"
              encType="multipart/form-data"
            >
              <>
                <section className="py-4 py-lg-6 bg-primary rounded-3">
                  <div className="container">
                    <div className="row">
                      <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                        <div className="d-lg-flex align-items-center justify-content-between">
                          {/* Content */}
                          <div className="mb-4 mb-lg-0">
                            <h1 className="text-white mb-1">Add New Course</h1>
                            <p className="mb-0 text-white lead">
                              Just fill the form and create your courses.
                            </p>
                          </div>
                          <div>
                            <Link
                              to="/instructor/courses/"
                              className="btn"
                              style={{ backgroundColor: "white" }}
                            >
                              {" "}
                              <i className="fas fa-arrow-left"></i> Back to
                              Course
                            </Link>
                            <a
                              href="instructor-courses.html"
                              className="btn btn-dark ms-2"
                            >
                              Save <i className="fas fa-check-circle"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="pb-8 mt-5">
                  <div className="card mb-3">
                    {/* Basic Info Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Basic Information</h4>
                    </div>
                    <div className="card-body">
                      <label htmlFor="courseTHumbnail" className="form-label">
                        Thumbnail Preview
                      </label>
                      <img
                        style={{
                          width: "100%",
                          height: "330px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                        className="mb-4"
                        src={
                          course?.image.preview ||
                          course.image ||
                          "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                        }
                        alt=""
                      />
                      <div className="mb-3">
                        <label htmlFor="courseTHumbnail" className="form-label">
                          Course Thumbnail
                        </label>
                        <input
                          id="courseTHumbnail"
                          className="form-control"
                          type="file"
                          name="image"
                          onChange={handleCourseImageChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="courseTitle" className="form-label">
                          Intro Video
                        </label>
                        <input
                          id="introvideo"
                          className="form-control"
                          type="file"
                          name="file"
                          onChange={handleCourseIntroVideoChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="courseTitle" className="form-label">
                          Title
                        </label>
                        <input
                          id="courseTitle"
                          className="form-control"
                          type="text"
                          placeholder=""
                          name="title"
                          onChange={handlecourseInputChange}
                          defaultValue={course.title}
                        />
                        <small>Write a 60 character course title.</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Courses category</label>
                        <select
                          className="form-select"
                          name="category"
                          onChange={handlecourseInputChange}
                          value={course.category.id}
                        >
                          <option value="">-------------</option>
                          {category?.map((c, i) => (
                            <option value={c.id} key={i}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                        <small>
                          Help people find your courses by choosing categories
                          that represent your course.
                        </small>
                      </div>
                      <div className="mb-3">
                        <option value="">Select Level</option>
                        <select
                          className="form-select"
                          name="level"
                          onChange={handlecourseInputChange}
                          value={course.level}
                        >
                          <option value="">-----------</option>
                          <option value="Beginer">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <option value="">Select Language</option>
                        <select
                          className="form-select"
                          name="language"
                          onChange={handlecourseInputChange}
                          value={course.language}
                        >
                          <option value="">-----------</option>
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <option value="">Select Language</option>
                        <select
                          className="form-select"
                          name="teacher_course_status"
                          onChange={handlecourseInputChange}
                          value={course.teacher_course_status}
                        >
                          <option value="">-----------</option>
                          <option value="Draft">Draft</option>
                          <option value="Disbaled">Disabled</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Course Description</label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={ckEditorData}
                          onChange={handleCkEditorChange}
                          style={{ height: "500px" }}
                          name="description"
                          value={course.description || ""}
                        />
                        <small>A brief summary of your courses.</small>
                      </div>
                      <label htmlFor="courseTitle" className="form-label">
                        Price
                      </label>
                      <input
                        id="courseTitle"
                        className="form-control"
                        type="number"
                        placeholder="$20.99"
                        onChange={handlecourseInputChange}
                        name="price"
                        defaultValue={course.price}
                      />
                    </div>

                    {/* Curriculum Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Curriculum</h4>
                    </div>
                    <div className="card-body ">
                      {variants?.map((variant, varindex) => (
                        <div
                          className="border p-2 rounded-3 mb-3"
                          style={{ backgroundColor: "#ededed" }}
                          key={varindex}
                        >
                          <div className="d-flex mb-4">
                            <input
                              type="text"
                              placeholder="Section Name"
                              required
                              className="form-control"
                              onChange={(e) =>
                                handleVariantOnChange(
                                  varindex,
                                  "title",
                                  e.target.value
                                )
                              }
                              value={variant?.title}
                            />
                            <button
                              className="btn btn-danger ms-2"
                              type="button"
                              onClick={() =>
                                removeVariant(varindex, variant.variant_id)
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          {variant.items?.map((vitem, itemIndex) => (
                            <div
                              className=" mb-2 mt-2 shadow p-2 rounded-3 "
                              style={{ border: "1px #bdbdbd solid" }}
                              key={itemIndex}
                            >
                              <input
                                type="text"
                                placeholder="Lesson Title"
                                className="form-control me-1 mt-2"
                                name="title"
                                onChange={(e) =>
                                  handleVariantItemChange(
                                    itemIndex,
                                    varindex,
                                    "title",
                                    e.target.value,
                                    e.target.type
                                  )
                                }
                                defaultValue={vitem.title}
                              />
                              <textarea
                                name="description"
                                cols="30"
                                rows="4"
                                className="form-control mt-2"
                                placeholder="Lesson Description"
                                onChange={(e) =>
                                  handleVariantItemChange(
                                    itemIndex,
                                    varindex,
                                    "description",
                                    e.target.value,
                                    e.target.type
                                  )
                                }
                                value={vitem.description}
                              ></textarea>
                              <div className="row d-flex align-items-center">
                                <div className="col-lg-8">
                                  <input
                                    type="file"
                                    className="form-control me-1 mt-2"
                                    name="file"
                                    onChange={(e) =>
                                      handleVariantItemChange(
                                        itemIndex,
                                        varindex,
                                        "file",
                                        e.target.files[0],
                                        e.target.type
                                      )
                                    }
                                  />
                                  {vitem.file && (
                                    <small className="text-success">
                                      File uploaded: {vitem.file.name}
                                    </small>
                                  )}
                                </div>
                                <div className="col-lg-4">
                                  <label htmlFor={`checkbox${1}`}>
                                    Preview
                                  </label>
                                  <input
                                    type="checkbox"
                                    className="form-check-input ms-2"
                                    name="preview"
                                    id={`checkbox${itemIndex}`}
                                    onChange={(e) =>
                                      handleVariantItemChange(
                                        itemIndex,
                                        varindex,
                                        "preview",
                                        e.target.checked,
                                        e.target.type
                                      )
                                    }
                                    checked={vitem.preview}
                                  />
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger me-2 mt-2"
                                type="button"
                                onClick={() =>
                                  removeVariantItem(
                                    varindex,
                                    itemIndex,
                                    variant.variant_id,
                                    vitem.variant_item_id
                                  )
                                }
                              >
                                Delete Lesson <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ))}

                          <button
                            className="btn btn-sm btn-primary mt-2"
                            type="button"
                            onClick={() => addVariantItem(varindex)}
                          >
                            + Add Lesson
                          </button>
                        </div>
                      ))}

                      <button
                        className="btn btn-sm btn-secondary w-100 mt-2"
                        type="button"
                        onClick={addVariant}
                      >
                        + New Section
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-lg btn-success w-100 mt-2"
                    type="submit"
                  >
                    Create Course <i className="fas fa-check-circle"></i>
                  </button>
                </section>
              </>
            </form>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default CourseEdit;
