// import { Employee, Education } from "@/types";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Plus, Trash } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/redux/store";
// import { getAllCitiesThunk } from "@/redux/features/travelcity/travelcitySlice";
// import { useEffect } from "react";
// import { fetchAllCities } from "@/redux/features/state/stateSlice";

// interface StepProps {
//   data: Partial<Employee>;
//   onChange: (d: Partial<Employee>) => void;
// }

// const F = ({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) => {
//   const isRequired = label.includes("*");
//   const cleanLabel = label.replace("*", "");

//   return (
//     <div className="space-y-1.5">
//       <Label className="text-sm font-medium text-black">
//         {cleanLabel}
//         {isRequired && <span className="text-red-500 ml-1">*</span>}
//       </Label>
//       {children}
//     </div>
//   );
// };

// export function StepEducation({ data, onChange }: StepProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const { cities, loading } = useSelector((state: RootState) => state.states);

//   useEffect(() => {
//     dispatch(fetchAllCities());
//   }, [dispatch]);

//   // ✅ Properly typed default object
//   const defaultEducation: Education = {
//     qualificationTypes: "",
//     location: "",
//     city: "",
//     yearOfPassing: "",
//     cgpa: "",
//     pursuing: "No",

//     // optional fields
//     qualification: "",
//     institute: "",
//     university: "",
//     schoolName: "",
//     board: "",
//     vocationalCourse: "",
//     pursuingCourse: "",
//     currentYear: "",
//     educationLeft: "",
//     currentStatus: "",
//   };

//   // ✅ Strictly typed array (NO UNION TYPE)
//   const educationList: Education[] =
//     data.education && data.education.length > 0
//       ? data.education
//       : [defaultEducation];

//   // ✅ Properly typed change handler
//   const handleChange = (
//     index: number,
//     field: keyof Education,
//     value: string,
//   ) => {
//     const updated: Education[] = [...educationList];

//     updated[index] = {
//       ...updated[index],
//       [field]: value,
//     };

//     onChange({ education: updated });
//   };

//   const addEducation = () => {
//     onChange({
//       education: [...educationList, { ...defaultEducation }],
//     });
//   };

//   const removeEducation = (index: number) => {
//     const updated = educationList.filter((_, i) => i !== index);
//     onChange({ education: updated });
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="text-gray-500">Loading cities...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {educationList.map((edu, index) => (
//         <div key={index} className="border rounded-xl p-4 space-y-4 relative">
//           {educationList.length > 1 && (
//             <button
//               type="button"
//               onClick={() => removeEducation(index)}
//               className="absolute top-3 right-3 border-2 border-red-500 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full"
//             >
//               <Trash size={16} />
//             </button>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {/* Qualification Type */}
//             <F label="Qualification Types *">
//               <select
//                 className="w-full border rounded-md p-2"
//                 value={edu.qualificationTypes}
//                 onChange={(e) =>
//                   handleChange(index, "qualificationTypes", e.target.value)
//                 }
//               >
//                 <option value="">Select</option>
//                 <option value="12th">12th </option>
//                 <option value="Graduation">Graduation</option>
//                 <option value="Post Graduation">Post Graduation</option>
//                 <option value="Diploma">Diploma</option>
//                 <option value="Others">Others</option>
//               </select>
//             </F>

//             {/* Show if NOT 12th */}
//             <F label="Qualification *">
//               <Input
//                 value={edu.qualification}
//                 onChange={(e) =>
//                   handleChange(index, "qualification", e.target.value)
//                 }
//                 placeholder="Enter qualification"
//               />
//             </F>

//             {/* Show Institute only if NOT 12th */}
//             {edu.qualificationTypes !== "12th" && (
//               <F label="Institute / Collage *">
//                 <Input
//                   value={edu.institute}
//                   onChange={(e) =>
//                     handleChange(index, "institute", e.target.value)
//                   }
//                   placeholder="Enter institute/collage name"
//                 />
//               </F>
//             )}
//             {edu.qualificationTypes !== "12th" && (
//               <F label="University *">
//                 <Input
//                   value={edu.university}
//                   onChange={(e) =>
//                     handleChange(index, "university", e.target.value)
//                   }
//                   placeholder="Enter university name"
//                 />
//               </F>
//             )}

//             {/* If 12th selected */}
//             {edu.qualificationTypes === "12th" && (
//               <>
//                 <F label="School Name *">
//                   <Input
//                     value={edu.schoolName}
//                     onChange={(e) =>
//                       handleChange(index, "schoolName", e.target.value)
//                     }
//                     placeholder="Enter school name"
//                   />
//                 </F>

//                 <F label="Board *">
//                   <Input
//                     value={edu.board}
//                     onChange={(e) =>
//                       handleChange(index, "board", e.target.value)
//                     }
//                     placeholder="Enter board name"
//                   />
//                 </F>
//               </>
//             )}

//             <F label="Location *">
//               <Input
//                 value={edu.location}
//                 onChange={(e) =>
//                   handleChange(index, "location", e.target.value)
//                 }
//                 placeholder="Enter location"
//               />
//             </F>

//             {/* City - Dropdown */}
//             <F label="City *">
//               <Select
//                 value={edu.city || ""}
//                 onValueChange={(value) => handleChange(index, "city", value)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select City" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {cities && cities.length > 0 ? (
//                     cities.map((city) => (
//                       <SelectItem key={city.id} value={city.cityName}>
//                         {city.cityName}
//                       </SelectItem>
//                     ))
//                   ) : (
//                     <SelectItem value="no-cities" disabled>
//                       No cities available
//                     </SelectItem>
//                   )}
//                 </SelectContent>
//               </Select>
//             </F>

//             <F label="Year of Passing *">
//               <Input
//                 type="text"
//                 maxLength={4}
//                 value={edu.yearOfPassing}
//                 onChange={(e) =>
//                   handleChange(
//                     index,
//                     "yearOfPassing",
//                     e.target.value.replace(/\D/g, "").slice(0, 4),
//                   )
//                 }
//                 placeholder="YYYY"
//               />
//             </F>

//             <F label="Percentage / CGPA *">
//               <Input
//                 value={edu.cgpa}
//                 onChange={(e) => handleChange(index, "cgpa", e.target.value)}
//                 placeholder="Enter percentage or CGPA"
//               />
//             </F>

//             <F label="Currently Pursuing? *">
//               <select
//                 className="w-full border rounded-md p-2"
//                 value={edu.pursuing}
//                 onChange={(e) =>
//                   handleChange(index, "pursuing", e.target.value)
//                 }
//               >
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//               </select>
//             </F>

//             {edu.pursuing === "Yes" && (
//               <>
//                 <F label="Pursuing Course *">
//                   <Input
//                     value={edu.pursuingCourse}
//                     onChange={(e) =>
//                       handleChange(index, "pursuingCourse", e.target.value)
//                     }
//                     placeholder="Enter course name"
//                   />
//                 </F>

//                 <F label="Education Left (Years) *">
//                   <Input
//                     type="number"
//                     min="0"
//                     max="10"
//                     value={edu.educationLeft}
//                     onChange={(e) =>
//                       handleChange(index, "educationLeft", e.target.value)
//                     }
//                     placeholder="Years remaining"
//                   />
//                 </F>

//                 <F label="Current Status *">
//                   <Input
//                     value={edu.currentStatus}
//                     onChange={(e) =>
//                       handleChange(index, "currentStatus", e.target.value)
//                     }
//                     placeholder="e.g., 2nd year, 3rd semester"
//                   />
//                 </F>
//               </>
//             )}
//           </div>

//           {/* Optional: Show selected city info */}
//           {edu.city && (
//             <div className="text-xs text-green-600 mt-2">
//               Selected City: {edu.city}
//             </div>
//           )}
//         </div>
//       ))}

//       <Button
//         type="button"
//         onClick={addEducation}
//         className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
//       >
//         <Plus size={16} /> Add Another Education
//       </Button>
//     </div>
//   );
// }

import { Employee, Education } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getAllCitiesThunk } from "@/redux/features/travelcity/travelcitySlice";
import { useEffect } from "react";
import { fetchAllCities } from "@/redux/features/state/stateSlice";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

const F = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "");

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-black">
        {cleanLabel}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
};

// ✅ Safely normalizes education data into a proper array,
// no matter what shape it arrives in from the API (array, JSON string,
// object-with-numeric-keys, null, undefined, etc.)
function normalizeEducation(
  rawEducation: unknown,
  defaultEducation: Education,
): Education[] {
  let value = rawEducation;

  // Case 1: data came in as a JSON string (e.g. "[{...},{...}]")
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch (e) {
      console.error("Failed to parse education JSON string:", e);
      return [defaultEducation];
    }
  }

  // Case 2: proper array
  if (Array.isArray(value)) {
    return value.length > 0 ? (value as Education[]) : [defaultEducation];
  }

  // Case 3: object with numeric keys, e.g. { "0": {...}, "1": {...} }
  if (value && typeof value === "object") {
    const values = Object.values(value) as Education[];
    return values.length > 0 ? values : [defaultEducation];
  }

  // Fallback: null / undefined / anything else
  return [defaultEducation];
}

export function StepEducation({ data, onChange }: StepProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, loading } = useSelector((state: RootState) => state.states);

  useEffect(() => {
    dispatch(fetchAllCities());
  }, [dispatch]);

  // ✅ Properly typed default object
  const defaultEducation: Education = {
    qualificationTypes: "",
    location: "",
    city: "",
    yearOfPassing: "",
    cgpa: "",
    pursuing: "No",

    // optional fields
    qualification: "",
    institute: "",
    university: "",
    schoolName: "",
    board: "",
    vocationalCourse: "",
    pursuingCourse: "",
    currentYear: "",
    educationLeft: "",
    currentStatus: "",
  };

  // ✅ Strictly typed array (handles array / stringified JSON / object shapes)
  const educationList: Education[] = normalizeEducation(
    data.education,
    defaultEducation,
  );

  // ✅ Properly typed change handler
  const handleChange = (
    index: number,
    field: keyof Education,
    value: string,
  ) => {
    const updated: Education[] = [...educationList];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    onChange({ education: updated });
  };

  const addEducation = () => {
    onChange({
      education: [...educationList, { ...defaultEducation }],
    });
  };

  const removeEducation = (index: number) => {
    const updated = educationList.filter((_, i) => i !== index);
    onChange({ education: updated });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading cities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {educationList.map((edu, index) => (
        <div key={index} className="border rounded-xl p-4 space-y-4 relative">
          {educationList.length > 1 && (
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="absolute top-3 right-3 border-2 border-red-500 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full"
            >
              <Trash size={16} />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Qualification Type */}
            <F label="Qualification Types *">
              <select
                className="w-full border rounded-md p-2"
                value={edu.qualificationTypes}
                onChange={(e) =>
                  handleChange(index, "qualificationTypes", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="12th">12th </option>
                <option value="Graduation">Graduation</option>
                <option value="Post Graduation">Post Graduation</option>
                <option value="Diploma">Diploma</option>
                <option value="Others">Others</option>
              </select>
            </F>

            {/* Show if NOT 12th */}
            <F label="Qualification *">
              <Input
                value={edu.qualification}
                onChange={(e) =>
                  handleChange(index, "qualification", e.target.value)
                }
                placeholder="Enter qualification"
              />
            </F>

            {/* Show Institute only if NOT 12th */}
            {edu.qualificationTypes !== "12th" && (
              <F label="Institute / Collage *">
                <Input
                  value={edu.institute}
                  onChange={(e) =>
                    handleChange(index, "institute", e.target.value)
                  }
                  placeholder="Enter institute/collage name"
                />
              </F>
            )}
            {edu.qualificationTypes !== "12th" && (
              <F label="University *">
                <Input
                  value={edu.university}
                  onChange={(e) =>
                    handleChange(index, "university", e.target.value)
                  }
                  placeholder="Enter university name"
                />
              </F>
            )}

            {/* If 12th selected */}
            {edu.qualificationTypes === "12th" && (
              <>
                <F label="School Name *">
                  <Input
                    value={edu.schoolName}
                    onChange={(e) =>
                      handleChange(index, "schoolName", e.target.value)
                    }
                    placeholder="Enter school name"
                  />
                </F>

                <F label="Board *">
                  <Input
                    value={edu.board}
                    onChange={(e) =>
                      handleChange(index, "board", e.target.value)
                    }
                    placeholder="Enter board name"
                  />
                </F>
              </>
            )}

            <F label="Location *">
              <Input
                value={edu.location}
                onChange={(e) =>
                  handleChange(index, "location", e.target.value)
                }
                placeholder="Enter location"
              />
            </F>

            {/* City - Dropdown */}
            <F label="City *">
              <Select
                value={edu.city || ""}
                onValueChange={(value) => handleChange(index, "city", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities && cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.cityName}>
                        {city.cityName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-cities" disabled>
                      No cities available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </F>

            <F label="Year of Passing *">
              <Input
                type="text"
                maxLength={4}
                value={edu.yearOfPassing}
                onChange={(e) =>
                  handleChange(
                    index,
                    "yearOfPassing",
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                placeholder="YYYY"
              />
            </F>

            <F label="Percentage / CGPA *">
              <Input
                value={edu.cgpa}
                onChange={(e) => handleChange(index, "cgpa", e.target.value)}
                placeholder="Enter percentage or CGPA"
              />
            </F>

            <F label="Currently Pursuing? *">
              <select
                className="w-full border rounded-md p-2"
                value={edu.pursuing}
                onChange={(e) =>
                  handleChange(index, "pursuing", e.target.value)
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </F>

            {edu.pursuing === "Yes" && (
              <>
                <F label="Pursuing Course *">
                  <Input
                    value={edu.pursuingCourse}
                    onChange={(e) =>
                      handleChange(index, "pursuingCourse", e.target.value)
                    }
                    placeholder="Enter course name"
                  />
                </F>

                <F label="Education Left (Years) *">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={edu.educationLeft}
                    onChange={(e) =>
                      handleChange(index, "educationLeft", e.target.value)
                    }
                    placeholder="Years remaining"
                  />
                </F>

                <F label="Current Status *">
                  <Input
                    value={edu.currentStatus}
                    onChange={(e) =>
                      handleChange(index, "currentStatus", e.target.value)
                    }
                    placeholder="e.g., 2nd year, 3rd semester"
                  />
                </F>
              </>
            )}
          </div>

          {/* Optional: Show selected city info */}
          {edu.city && (
            <div className="text-xs text-green-600 mt-2">
              Selected City: {edu.city}
            </div>
          )}
        </div>
      ))}

      <Button
        type="button"
        onClick={addEducation}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
      >
        <Plus size={16} /> Add Another Education
      </Button>
    </div>
  );
}
