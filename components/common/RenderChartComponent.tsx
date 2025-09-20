import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../../types';

const COLORS = ['#1D4ED8', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];
const EXTENDED_COLORS = ['#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4', '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE', '#008080', '#E6BEFF', '#9A6324', '#FFFAC8', '#800000', '#AAFFC3'];

const RenderChartComponent: React.FC<{ data: ChartData }> = ({ data }) => {
  const colorPalette = data.data.length > 5 ? EXTENDED_COLORS : COLORS;
  return (
    <div className="w-full h-72 bg-slate-100 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        {data.chartType === 'bar' ? (
          <BarChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name={data.dataKey} fill="#1D4ED8" />
          </BarChart>
        ) : data.chartType === 'line' ? (
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" name={data.dataKey} stroke="#1D4ED8" activeDot={{ r: 8 }} />
          </LineChart>
        ) : (
          <PieChart>
            <Pie data={data.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {data.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RenderChartComponent;