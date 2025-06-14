
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail } from 'lucide-react';
import { Message } from '@/hooks/useAdminData';

interface MessageManagementProps {
  messages: Message[];
}

const MessageManagement: React.FC<MessageManagementProps> = ({ messages }) => {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-orange-500 p-2 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          Contact Messages ({messages.length})
        </CardTitle>
        <CardDescription className="text-gray-600">Customer inquiries and feedback</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {messages.length > 0 ? messages.map((message) => (
            <div key={message.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Mail className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{message.name}</p>
                    <p className="text-sm text-gray-600">{message.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {new Date(message.created_at).toLocaleDateString()}
                </Badge>
              </div>
              {message.subject && (
                <p className="font-medium text-gray-800 mb-2">Subject: {message.subject}</p>
              )}
              <p className="text-gray-700 leading-relaxed">{message.message}</p>
            </div>
          )) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages found</p>
              <p className="text-sm text-gray-400 mt-2">Messages will appear here when customers contact you</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageManagement;
