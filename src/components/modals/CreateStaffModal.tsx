import React, { useState } from "react";
import Button from "@/components/common/Button";

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { position: string; hiredate: string; salary: number }) => void;
  memberName?: string;
}

const CreateStaffModal: React.FC<CreateStaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  memberName,
}) => {
  const [position, setPosition] = useState("");
  const [hiredate, setHiredate] = useState(new Date().toISOString().slice(0, 10));
  const [salary, setSalary] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-white mb-4">
          Create Staff {memberName ? `for ${memberName}` : ""}
        </h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ position, hiredate, salary });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-secondary-300 mb-1">Position</label>
            <input
              type="text"
              value={position}
              onChange={e => setPosition(e.target.value)}
              className="w-full px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600"
              required
            />
          </div>
          <div>
            <label className="block text-secondary-300 mb-1">Hire Date</label>
            <input
              type="date"
              value={hiredate}
              onChange={e => setHiredate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600"
              required
            />
          </div>
          <div>
            <label className="block text-secondary-300 mb-1">Salary</label>
            <input
              type="number"
              value={salary}
              onChange={e => setSalary(Number(e.target.value))}
              className="w-full px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600"
              min={0}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white">
              Create Staff
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStaffModal;