
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface CollapsibleTableProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  itemCount?: number;
}

const CollapsibleTable: React.FC<CollapsibleTableProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  itemCount = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="bg-blue-500 p-2 rounded-lg">
              {icon}
            </div>
            {title} ({itemCount})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Data
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Data
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default CollapsibleTable;
